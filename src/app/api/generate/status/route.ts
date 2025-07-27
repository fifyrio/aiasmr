import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('Checking status for task:', taskId);

    // If this is a mock taskId (created when KIE API doesn't return taskId), 
    // return a pending status as we'll rely on callbacks
    if (taskId.startsWith('runway_')) {
      console.log('Mock taskId detected, returning pending status');
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'processing',
        result: null,
        error: null,
        progress: 50
      });
    }

    try {
      const kieClient = createKieVeo3Client();
      const status = await kieClient.getTaskStatus(taskId);

      return NextResponse.json({
        success: true,
        taskId: status.taskId,
        status: status.status,
        result: status.result,
        error: status.error,
        progress: status.progress
      });
    } catch (statusError) {
      console.log('KIE API status check failed, falling back to pending status:', statusError);
      
      // If KIE API status endpoint is not available, return processing status
      // and rely on callbacks for completion notification
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'processing',
        result: null,
        error: null,
        progress: 30
      });
    }

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}