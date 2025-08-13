import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';
import { completeVideoProcessing } from '@/lib/video-processor';
import { createClient } from '@/lib/supabase/server';
import { refundCredits, recordVideoCompletion } from '@/lib/credits-manager';

// Cache to track which tasks are already being processed
const processingTasks = new Set<string>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId'); // Pass userId from frontend
    const originalPrompt = searchParams.get('prompt');
    const triggers = searchParams.get('triggers');
    const duration = searchParams.get('duration');
    const quality = searchParams.get('quality');
    const aspectRatio = searchParams.get('aspectRatio');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Polling KIE API for task status:', taskId);

    // First check if video already exists in database
    const supabase = createClient();
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id, preview_url, thumbnail_url')
      .eq('video_id', taskId)
      .single();

    if (existingVideo) {
      console.log(`✅ Video already processed for task ${taskId}`);
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'completed',
        result: {
          videoUrl: existingVideo.preview_url,
          thumbnailUrl: existingVideo.thumbnail_url
        },
        error: null,
        progress: 100,
        videoId: existingVideo.id
      });
    }

    // Use KIE API to check task status directly
    const kieClient = createKieVeo3Client();
    
    try {
      const taskStatus = await kieClient.getTaskStatus(taskId);
      
      console.log(`📊 Task ${taskId} status: ${taskStatus.status} (${taskStatus.progress}%)`);

      // If task is completed and has video URL, trigger processing
      if (taskStatus.status === 'completed' && taskStatus.result?.videoUrl) {
        console.log(`🎬 Task ${taskId} completed, starting video processing...`);
        
        // Check if already processing to avoid duplicates
        if (processingTasks.has(taskId)) {
          console.log(`⏳ Task ${taskId} is already being processed`);
          return NextResponse.json({
            success: true,
            taskId: taskStatus.taskId,
            status: 'processing',
            result: null,
            error: null,
            progress: 75,
            message: 'Processing video and uploading to storage...'
          });
        }
        
        // Mark as processing
        processingTasks.add(taskId);
        
        try {
          // Process video asynchronously (don't wait for it to complete)
          const processingPromise = completeVideoProcessing(
            taskStatus.result.videoUrl,
            taskStatus.result.thumbnailUrl, // Use KIE-provided thumbnail URL
            {
              taskId,
              userId: userId || undefined,
              originalPrompt: originalPrompt || undefined,
              triggers: triggers ? triggers.split(',') : undefined,
              duration: duration || undefined,
              quality: quality || undefined,
              aspectRatio: aspectRatio || undefined
            }
          );

          // Start processing in background and handle completion
          processingPromise
            .then(result => {
              console.log(`✅ Video processing completed for task ${taskId}:`, result);
              processingTasks.delete(taskId);
            })
            .catch(error => {
              console.error(`❌ Video processing failed for task ${taskId}:`, error);
              processingTasks.delete(taskId);
            });

          // Return immediately with processing status
          return NextResponse.json({
            success: true,
            taskId: taskStatus.taskId,
            status: 'processing',
            result: null,
            error: null,
            progress: 75,
            message: 'Video generation completed, now processing and uploading...'
          });
          
        } catch (processingError) {
          processingTasks.delete(taskId);
          console.error(`❌ Failed to start video processing for ${taskId}:`, processingError);
          
          // Return the original KIE result even if processing fails
          return NextResponse.json({
            success: true,
            taskId: taskStatus.taskId,
            status: taskStatus.status,
            result: taskStatus.result,
            error: null,
            progress: taskStatus.progress
          });
        }
      }

      // Handle failed tasks - refund credits
      if (taskStatus.status === 'failed' && userId) {
        console.log(`💸 Task ${taskId} failed, processing refund...`);
        
        try {
          // Process refund for failed generation
          const refundResult = await refundCredits(
            userId,
            20, // Refund the same amount that was deducted
            `Video generation failed: ${taskStatus.error || 'Unknown error'}`,
            taskId
          );

          if (refundResult.success) {
            console.log(`💰 Refund processed for failed task ${taskId}. New balance: ${refundResult.newCredits}`);
          } else {
            console.error('Failed to process refund:', refundResult.error);
          }
        } catch (refundError) {
          console.error('Error processing refund for failed task:', refundError);
        }
      }

      // Return normal status for non-completed tasks
      return NextResponse.json({
        success: true,
        taskId: taskStatus.taskId,
        status: taskStatus.status,
        result: taskStatus.result,
        error: taskStatus.error,
        progress: taskStatus.progress
      });

    } catch (kieError) {
      console.error('❌ KIE API error while checking task status:', kieError);
      
      // If KIE API call fails, return appropriate error response
      return NextResponse.json({
        success: false,
        taskId: taskId,
        status: 'error',
        result: null,
        error: kieError instanceof Error ? kieError.message : 'Failed to check task status',
        progress: 0
      });
    }

  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}