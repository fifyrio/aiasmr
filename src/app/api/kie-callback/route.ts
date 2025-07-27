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
    video_id?: string;
    video_url?: string;
    image_url?: string;
    status?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: KieCallbackPayload = await request.json();
    const { code, msg, data } = payload;
    
    console.log('Received KIE video generation callback:', {
      taskId: data.task_id,
      videoId: data.video_id,
      status: code,
      message: msg
    });
    
    if (code === 200) {
      // Task completed successfully
      console.log('KIE video generation completed successfully');
      
      const { task_id, video_id, video_url, image_url } = data;
      
      console.log(`Video URL: ${video_url}`);
      console.log(`Cover Image URL: ${image_url}`);
      console.log('Note: Video URL is valid for 14 days');
      
      // Handle completed video
      await handleCompletedVideo(task_id, {
        videoId: video_id,
        videoUrl: video_url,
        imageUrl: image_url
      });
      
      // Optional: Download files to local storage
      if (process.env.DOWNLOAD_VIDEOS === 'true') {
        if (video_url) {
          downloadFile(video_url, `kie_video_${task_id}.mp4`)
            .then(() => console.log('Video downloaded successfully'))
            .catch(err => console.error('Video download failed:', err));
        }
        
        if (image_url) {
          downloadFile(image_url, `kie_cover_${task_id}.png`)
            .then(() => console.log('Cover image downloaded successfully'))
            .catch(err => console.error('Cover image download failed:', err));
        }
      }
      
    } else {
      // Task failed
      console.log('KIE video generation failed:', msg);
      
      // Handle specific error types
      if (code === 400) {
        console.log('Client error - check content, format, or quota');
      } else if (code === 500) {
        console.log('Server error - retry may be needed');
      }
      
      await handleFailedVideo(data.task_id, msg, code);
    }
    
    // Return 200 status code to confirm callback received
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

async function handleCompletedVideo(taskId: string, result: {
  videoId?: string;
  videoUrl?: string;
  imageUrl?: string;
}) {
  try {
    console.log(`Handling completed video: ${taskId}`, result);
    
    // Update database with completed video information
    const supabase = createClient();
    
    // First, try to find existing video record by task_id
    const { data: existingVideo, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('task_id', taskId)
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding video record:', findError);
      return;
    }
    
    // Update or create video record
    const videoData = {
      task_id: taskId,
      video_id: result.videoId,
      video_url: result.videoUrl,
      thumbnail_url: result.imageUrl,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (existingVideo) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', existingVideo.id);
      
      if (updateError) {
        console.error('Error updating video record:', updateError);
      } else {
        console.log('Video record updated successfully');
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('videos')
        .insert(videoData);
      
      if (insertError) {
        console.error('Error inserting video record:', insertError);
      } else {
        console.log('Video record created successfully');
      }
    }
    
  } catch (error) {
    console.error('Error handling completed video:', error);
  }
}

async function handleFailedVideo(taskId: string, errorMessage?: string, errorCode?: number) {
  try {
    console.log(`Handling failed video: ${taskId}`, { errorMessage, errorCode });
    
    // Update database with failure status
    const supabase = createClient();
    
    const { data: existingVideo, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('task_id', taskId)
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding video record:', findError);
      return;
    }
    
    const videoData = {
      task_id: taskId,
      status: 'failed',
      error_message: errorMessage,
      error_code: errorCode,
      updated_at: new Date().toISOString()
    };
    
    if (existingVideo) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', existingVideo.id);
      
      if (updateError) {
        console.error('Error updating failed video record:', updateError);
      } else {
        console.log('Failed video record updated successfully');
      }
    } else {
      // Create new record for failed video
      const { error: insertError } = await supabase
        .from('videos')
        .insert(videoData);
      
      if (insertError) {
        console.error('Error inserting failed video record:', insertError);
      } else {
        console.log('Failed video record created successfully');
      }
    }
    
  } catch (error) {
    console.error('Error handling failed video:', error);
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