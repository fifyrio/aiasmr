import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const provider = searchParams.get('provider') as 'runway' | 'veo3';

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking video generation status for task:', taskId);

    const supabase = createClient();

    if (provider === 'veo3') {
      // VEO3 uses callback-only mechanism - check database for completion
      console.log(`📊 VEO3 Task ${taskId}: Checking database status (callback-only mechanism)`);
      
      // Check if video already exists in database (completed via callback)
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id, preview_url, thumbnail_url, status')
        .eq('task_id', taskId)
        .single();

      if (existingVideo) {
        if (existingVideo.status === 'ready') {
          console.log(`✅ VEO3 video processing completed for task ${taskId}`);
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
            message: 'Video processed and ready!',
            videoId: existingVideo.id
          });
        } else if (existingVideo.status === 'failed') {
          console.log(`❌ VEO3 video generation failed for task ${taskId}`);
          return NextResponse.json({
            success: true,
            taskId: taskId,
            status: 'failed',
            result: null,
            error: 'Video generation failed',
            progress: 0
          });
        }
      }
      
      // If not found in database, still processing (waiting for callback)
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'processing',
        result: null,
        error: null,
        progress: 50,
        message: 'Video generation in progress, waiting for callback...'
      });
      
    } else {
      // Runway also uses callback-only mechanism - check database for completion
      console.log(`📊 Runway Task ${taskId}: Checking database status (callback-only mechanism)`);
      
      // Check if video already exists in database (completed via callback)
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id, preview_url, thumbnail_url, status')
        .eq('task_id', taskId)
        .single();

      if (existingVideo) {
        if (existingVideo.status === 'ready') {
          console.log(`✅ Runway video processing completed for task ${taskId}`);
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
            message: 'Video processed and ready!',
            videoId: existingVideo.id
          });
        } else if (existingVideo.status === 'failed') {
          console.log(`❌ Runway video generation failed for task ${taskId}`);
          return NextResponse.json({
            success: true,
            taskId: taskId,
            status: 'failed',
            result: null,
            error: 'Video generation failed',
            progress: 0
          });
        }
      }
      
      // If not found in database, still processing (waiting for callback)
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'processing',
        result: null,
        error: null,
        progress: 50,
        message: 'Video generation in progress, waiting for callback...'
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