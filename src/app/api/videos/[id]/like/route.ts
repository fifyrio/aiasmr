import { NextRequest, NextResponse } from 'next/server';

// Mock like storage (in a real app, this would be in a database)
const videoLikes: { [key: string]: number } = {
  '1': 2847,
  '2': 1923,
  '3': 3456,
  '4': 1567,
  '5': 2134,
  '6': 987,
  '7': 1456,
  '8': 2789
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    if (!videoLikes[videoId]) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment like count
    videoLikes[videoId] += 1;

    return NextResponse.json({
      success: true,
      videoId,
      likes: videoLikes[videoId]
    });

  } catch (error) {
    console.error('Error liking video:', error);
    return NextResponse.json(
      { error: 'Failed to like video' },
      { status: 500 }
    );
  }
}