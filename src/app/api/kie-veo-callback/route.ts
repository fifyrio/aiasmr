import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { refundCredits } from '@/lib/credits-manager';

interface VeoCallbackPayload {
  code: number;
  msg: string;
  data: {
    taskId: string;
    info?: {
      resultUrls?: string[];
      originUrls?: string[];
      resolution?: string;
    };
    fallbackFlag?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse callback payload
    const payload: VeoCallbackPayload = await request.json();
    const { code, msg, data } = payload;
    
    console.log('Received VEO3 video generation callback:', {
      taskId: data.taskId,
      status: code,
      message: msg,
      hasInfo: !!data.info,
      fallbackFlag: data.fallbackFlag,
      timestamp: new Date().toISOString()
    });
    
    const taskId = data.taskId;
    if (!taskId) {
      console.error('Missing taskId in VEO3 callback payload');
      return NextResponse.json({ status: 'error', message: 'Missing taskId' }, { status: 400 });
    }
    
    if (code === 200) {
      // Task completed successfully
      console.log('✅ VEO3 video generation completed successfully');
      await handleVeo3Success(taskId, data, msg);
    } else {
      // Task failed
      console.log('❌ VEO3 video generation failed:', msg);
      await handleVeo3Failure(taskId, data, msg, code);
    }
    
    // Return 200 status code quickly to confirm callback received
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('❌ VEO3 callback processing error:', error);
    
    // Log detailed error information
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON in VEO3 callback payload');
    } else if (error instanceof Error) {
      console.error('VEO3 callback error details:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Failed to process VEO3 callback' },
      { status: 500 }
    );
  }
}

async function handleVeo3Success(taskId: string, data: VeoCallbackPayload['data'], msg: string) {
  try {
    console.log('🎬 VEO3 Success callback received');
    
    // Extract VEO3 specific data from data.info
    const videoUrl = data.info?.resultUrls?.[0];
    const imageUrl = data.info?.originUrls?.[0];
    const resolution = data.info?.resolution;
    
    console.log('VEO3 callback details:', {
      hasInfo: !!data.info,
      resultUrls: data.info?.resultUrls,
      originUrls: data.info?.originUrls,
      resolution: resolution,
      fallbackFlag: data.fallbackFlag
    });
    
    console.log(`📹 VEO3 Video URL: ${videoUrl}`);
    console.log(`🖼️ VEO3 Cover Image URL: ${imageUrl}`);
    
    // Validate required fields
    if (!videoUrl) {
      console.error('Missing video URL in VEO3 success callback');
      await handleVeo3Failure(taskId, data, 'Missing video URL in VEO3 callback', 500);
      return;
    }
    
    // Save to database
    await saveVeo3Video(taskId, {
      videoId: taskId,
      videoUrl: videoUrl,
      imageUrl: imageUrl || videoUrl, // Use video URL as fallback
      resolution: resolution || '1080p'
    });
    
  } catch (error) {
    console.error('❌ Error handling VEO3 success:', error);
    await handleVeo3Failure(taskId, data, 'Error processing VEO3 success callback', 500);
  }
}

async function handleVeo3Failure(taskId: string, data: VeoCallbackPayload['data'], msg: string, code: number) {
  try {
    console.log(`💥 VEO3 Generation failed: ${taskId}`, { 
      errorMessage: msg, 
      errorCode: code,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific VEO3 error types
    if (code === 422) {
      console.log('🚫 VEO3 Content policy violation detected:');
      if (msg.includes('content policies') || msg.includes('violating')) {
        console.log('   - Content was flagged by moderation system');
      }
    } else if (code === 400) {
      console.log('🚫 VEO3 Client error detected:');
      if (msg.includes('Inappropriate content')) {
        console.log('   - Content moderation failure');
      } else if (msg.includes('format')) {
        console.log('   - Format error');
      } else if (msg.includes('quota') || msg.includes('limit')) {
        console.log('   - Quota or rate limit exceeded');
      } else {
        console.log('   - Other client-side issue');
      }
    } else if (code === 500) {
      console.log('🔧 Server error - retry may be needed');
    }
    
    // Determine failure reason
    let failureReason = 'VEO3 generation failed';
    if (code === 422) {
      if (msg.includes('content policies') || msg.includes('violating')) {
        failureReason = 'Content policy violation';
      } else {
        failureReason = 'Request rejected';
      }
    } else if (code === 400) {
      if (msg.includes('Inappropriate content')) {
        failureReason = 'Content not allowed';
      } else if (msg.includes('format')) {
        failureReason = 'Invalid format';
      } else if (msg.includes('quota') || msg.includes('limit')) {
        failureReason = 'Quota exceeded';
      } else {
        failureReason = 'Invalid request';
      }
    } else if (code === 500) {
      failureReason = 'Server error';
    }
    
    await saveFailedVideo(taskId, failureReason, 'veo3');
    await processRefundForFailedGeneration(taskId, msg);
    
  } catch (error) {
    console.error('❌ Error handling VEO3 failure:', error);
  }
}

async function saveVeo3Video(taskId: string, result: {
  videoId: string;
  videoUrl: string;
  imageUrl: string;
  resolution?: string;
}) {
  try {
    console.log(`📝 Creating VEO3 video record for task: ${taskId}`);
    
    // Use service client to bypass RLS for callback operations
    const supabase = createServiceClient();
    const videoData = {
      task_id: taskId,
      title: `VEO3 ASMR Video ${new Date().toISOString().slice(0, 10)}`,
      description: 'AI-generated ASMR video via VEO3',
      prompt: 'Generated via KIE VEO3 API',
      triggers: [],
      category: 'Object',
      status: 'ready',
      credit_cost: 20,
      duration: '5s',
      resolution: result.resolution || '1080p',
      preview_url: result.videoUrl,
      download_url: result.videoUrl,
      thumbnail_url: result.imageUrl,
      provider: 'kie-veo3',
      generation_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(videoData);
    
    if (insertError) {
      console.error('❌ Error inserting VEO3 video record:', insertError);
    } else {
      console.log('✅ VEO3 video record created successfully');
      console.log(`🎥 VEO3 Video ready: ${videoData.title}`);
    }
    
  } catch (error) {
    console.error('❌ Error saving VEO3 video:', error);
  }
}

async function saveFailedVideo(taskId: string, failureReason: string, provider: string) {
  try {
    console.log(`📝 Creating failed ${provider.toUpperCase()} video record for task: ${taskId}`);
    
    // Use service client to bypass RLS for callback operations
    const supabase = createServiceClient();
    const videoData = {
      task_id: taskId,
      title: `Failed ${provider.toUpperCase()} Video ${new Date().toISOString().slice(0, 10)}`,
      description: `Failed: ${failureReason} (${provider.toUpperCase()})`,
      prompt: `Failed ${provider.toUpperCase()} generation`,
      triggers: [],
      category: 'Object',
      status: 'failed',
      credit_cost: 0,
      duration: '0s',
      resolution: '720p',
      provider: `kie-${provider}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(videoData);
    
    if (insertError) {
      console.error(`❌ Error inserting failed ${provider} video record:`, insertError);
    } else {
      console.log(`✅ Failed ${provider} video record created successfully`);
    }
    
  } catch (error) {
    console.error(`❌ Error saving failed ${provider} video:`, error);
  }
}

async function processRefundForFailedGeneration(taskId: string, errorMessage: string) {
  try {
    console.log(`💰 Processing refund for failed VEO3 generation: ${taskId}`);
    
    // Use service client to bypass RLS for admin operations
    const supabase = createServiceClient();
    
    // Find the credit transaction for this task using video_id field
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .select('user_id, amount')
      .eq('video_id', taskId)
      .eq('transaction_type', 'usage')
      .single();
    
    if (transaction && transaction.user_id) {
      // Process refund for failed generation using service client
      await processRefundWithServiceClient(
        transaction.user_id,
        Math.abs(transaction.amount),
        `VEO3 generation failed: ${errorMessage}`,
        taskId
      );
    } else {
      console.log('No credit transaction found for failed VEO3 task:', taskId);
    }
    
  } catch (error) {
    console.error('Error processing VEO3 refund:', error);
  }
}

async function processRefundWithServiceClient(
  userId: string, 
  amount: number, 
  description: string,
  taskId?: string
) {
  try {
    const supabase = createServiceClient();

    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile for refund:', profileError);
      return;
    }

    // Update user credits
    const newCredits = profile.credits + amount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user credits for refund:', updateError);
      return;
    }

    // Log refund transaction using service client (bypasses RLS)
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'refund',
        amount: amount,
        description: taskId ? `${description} - Task: ${taskId}` : description,
        video_id: taskId,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error logging refund transaction:', transactionError);
    } else {
      console.log(`💰 Refund processed for VEO3 task ${taskId}. New balance: ${newCredits}`);
    }

  } catch (error) {
    console.error('Error in processRefundWithServiceClient:', error);
  }
}