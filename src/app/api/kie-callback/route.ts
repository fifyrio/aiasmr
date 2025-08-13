import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import https from 'https';
import fs from 'fs';
import path from 'path';

interface KieCallbackPayload {
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
    const payload: KieCallbackPayload = await request.json();
    const { code, msg, data } = payload;
    
    console.log('Received KIE Runway video generation callback:', {
      taskId: data.task_id,
      videoId: data.video_id,
      status: code,
      message: msg,
      timestamp: new Date().toISOString()
    });
    
    // Validate task_id exists
    if (!data.task_id) {
      console.error('Missing task_id in callback payload');
      return NextResponse.json({ status: 'error', message: 'Missing task_id' }, { status: 400 });
    }
    
    if (code === 200) {
      // Task completed successfully
      console.log('✅ KIE video generation completed successfully');
      
      const { task_id, video_id, video_url, image_url } = data;
      
      console.log(`📹 Video URL: ${video_url}`);
      console.log(`🖼️ Cover Image URL: ${image_url}`);
      console.log('⏰ Note: Video URL is valid for 14 days');
      
      // Validate required success fields
      if (!video_url || !image_url) {
        console.error('Missing video_url or image_url in success callback');
        await handleFailedVideo(task_id, 'Missing video URLs in success callback', 500);
      } else {
        // Handle completed video
        await handleCompletedVideo(task_id, {
          videoId: video_id,
          videoUrl: video_url,
          imageUrl: image_url
        });
      }
      
    } else {
      // Task failed
      console.log('❌ KIE video generation failed:', msg);
      
      // Handle specific error types with detailed logging
      if (code === 400) {
        console.log('🚫 Client error detected:');
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
      
      await handleFailedVideo(data.task_id, msg, code);
    }
    
    // Return 200 status code quickly to confirm callback received
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    
    // Log detailed error information
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON in callback payload');
    } else if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

async function handleCompletedVideo(taskId: string, result: {
  videoId: string;
  videoUrl: string;
  imageUrl: string;
}) {
  try {
    console.log(`🎬 Handling completed video: ${taskId}`, {
      videoId: result.videoId,
      hasVideoUrl: !!result.videoUrl,
      hasImageUrl: !!result.imageUrl
    });
    
    // Update database with completed video information
    const supabase = createClient();
    
    // Create new video record (we no longer track task_id)
    console.log(`📝 Creating new video record for completed generation`);
    
    const videoData = {
      video_id: result.videoId,
      title: `ASMR Video ${new Date().toISOString().slice(0, 10)}`,
      description: 'AI-generated ASMR video',
      prompt: 'Generated via KIE API',
      triggers: [],
      category: 'Object',
      status: 'ready',
      credit_cost: 1,
      duration: '5s',
      resolution: '720p',
      preview_url: result.videoUrl,
      download_url: result.videoUrl,
      thumbnail_url: result.imageUrl,
      generation_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(videoData);
    
    if (insertError) {
      console.error('❌ Error inserting video record:', insertError);
    } else {
      console.log('✅ Video record created successfully');
      console.log(`🎥 Video ready: ${videoData.title}`);
      console.log(`   - Video URL: ${result.videoUrl}`);
      console.log(`   - Thumbnail: ${result.imageUrl}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling completed video:', error);
  }
}

async function handleFailedVideo(taskId: string, errorMessage: string, errorCode: number) {
  try {
    console.log(`💥 Handling failed video: ${taskId}`, { 
      errorMessage, 
      errorCode,
      timestamp: new Date().toISOString()
    });
    
    // Update database with failure status
    const supabase = createClient();
    
    // Determine failure reason for better user feedback
    let failureReason = 'Generation failed';
    if (errorCode === 400) {
      if (errorMessage.includes('Inappropriate content')) {
        failureReason = 'Content not allowed';
      } else if (errorMessage.includes('format')) {
        failureReason = 'Invalid format';
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        failureReason = 'Quota exceeded';
      } else {
        failureReason = 'Invalid request';
      }
    } else if (errorCode === 500) {
      failureReason = 'Server error';
    }
    
    // Create failed video record (we no longer track task_id)
    console.log(`📝 Creating failed video record`);
    const videoData = {
      title: `Failed Video ${new Date().toISOString().slice(0, 10)}`,
      description: `Failed: ${failureReason}`,
      prompt: 'Failed generation',
      triggers: [],
      category: 'Object',
      status: 'failed',
      credit_cost: 0,
      duration: '0s',
      resolution: '720p',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(videoData);
    
    if (insertError) {
      console.error('❌ Error inserting failed video record:', insertError);
    } else {
      console.log('✅ Failed video record created successfully');
      console.log(`   - Reason: ${failureReason}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling failed video:', error);
  }
}

// Helper function to download files (optional feature)
function downloadFile(url: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    const filePath = path.join(downloadsDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`File downloaded: ${filePath}`);
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}