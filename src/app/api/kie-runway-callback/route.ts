import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { refundCredits } from '@/lib/credits-manager';

interface RunwayCallbackPayload {
  code: number;
  msg: string;
  data: {
    task_id: string;
    video_id: string;
    video_url: string;
    image_url: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse callback payload
    const payload: RunwayCallbackPayload = await request.json();
    const { code, msg, data } = payload;
    
    console.log('Received Runway video generation callback:', {
      taskId: data.task_id,
      videoId: data.video_id,
      status: code,
      message: msg,
      timestamp: new Date().toISOString()
    });
    
    const taskId = data.task_id;
    if (!taskId) {
      console.error('Missing task_id in Runway callback payload');
      return NextResponse.json({ status: 'error', message: 'Missing task_id' }, { status: 400 });
    }
    
    if (code === 200) {
      // Task completed successfully
      console.log('✅ Runway video generation completed successfully');
      await handleRunwaySuccess(taskId, data, msg);
    } else {
      // Task failed
      console.log('❌ Runway video generation failed:', msg);
      await handleRunwayFailure(taskId, data, msg, code);
    }
    
    // Return 200 status code quickly to confirm callback received
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('❌ Runway callback processing error:', error);
    
    // Log detailed error information
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON in Runway callback payload');
    } else if (error instanceof Error) {
      console.error('Runway callback error details:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Failed to process Runway callback' },
      { status: 500 }
    );
  }
}

async function handleRunwaySuccess(taskId: string, data: RunwayCallbackPayload['data'], msg: string) {
  try {
    console.log('🎬 Runway Success callback received');
    
    // Extract Runway specific data
    const videoUrl = data.video_url;
    const imageUrl = data.image_url;
    const videoId = data.video_id;
    
    console.log(`📹 Runway Video URL: ${videoUrl}`);
    console.log(`🖼️ Runway Cover Image URL: ${imageUrl}`);
    
    // Validate required fields
    if (!videoUrl || !imageUrl) {
      console.error('Missing video_url or image_url in Runway success callback');
      await handleRunwayFailure(taskId, data, 'Missing video URLs in Runway callback', 500);
      return;
    }
    
    // Save to database
    await saveRunwayVideo(taskId, {
      videoId: videoId,
      videoUrl: videoUrl,
      imageUrl: imageUrl
    });
    
  } catch (error) {
    console.error('❌ Error handling Runway success:', error);
    await handleRunwayFailure(taskId, data, 'Error processing Runway success callback', 500);
  }
}

async function handleRunwayFailure(taskId: string, data: RunwayCallbackPayload['data'], msg: string, code: number) {
  try {
    console.log(`💥 Runway Generation failed: ${taskId}`, { 
      errorMessage: msg, 
      errorCode: code,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific error types with detailed logging
    if (code === 400) {
      console.log('🚫 Runway Client error detected:');
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
    let failureReason = 'Runway generation failed';
    if (code === 400) {
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
    
    await saveFailedVideo(taskId, failureReason, 'runway');
    await processRefundForFailedGeneration(taskId, msg);
    
  } catch (error) {
    console.error('❌ Error handling Runway failure:', error);
  }
}

async function saveRunwayVideo(taskId: string, result: {
  videoId: string;
  videoUrl: string;
  imageUrl: string;
}) {
  try {
    console.log(`📝 Creating Runway video record for task: ${taskId}`);
    
    // Use service client to bypass RLS for callback operations
    const supabase = createServiceClient();
    const videoData = {
      task_id: taskId,
      title: `Runway ASMR Video ${new Date().toISOString().slice(0, 10)}`,
      description: 'AI-generated ASMR video via Runway',
      prompt: 'Generated via KIE Runway API',
      triggers: [],
      category: 'Object',
      status: 'ready',
      credit_cost: 12, // Default Runway 5s cost, will be updated with actual
      duration: '5s',
      resolution: '720p',
      preview_url: result.videoUrl,
      download_url: result.videoUrl,
      thumbnail_url: result.imageUrl,
      provider: 'kie-runway',
      generation_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(videoData);
    
    if (insertError) {
      console.error('❌ Error inserting Runway video record:', insertError);
    } else {
      console.log('✅ Runway video record created successfully');
      console.log(`🎥 Runway Video ready: ${videoData.title}`);
    }
    
  } catch (error) {
    console.error('❌ Error saving Runway video:', error);
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
    console.log(`💰 Processing refund for failed Runway generation: ${taskId}`);
    
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
        `Runway generation failed: ${errorMessage}`,
        taskId
      );
    } else {
      console.log('No credit transaction found for failed Runway task:', taskId);
    }
    
  } catch (error) {
    console.error('Error processing Runway refund:', error);
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
      console.log(`💰 Refund processed for Runway task ${taskId}. New balance: ${newCredits}`);
    }

  } catch (error) {
    console.error('Error in processRefundWithServiceClient:', error);
  }
}