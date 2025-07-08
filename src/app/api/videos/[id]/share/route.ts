import { NextRequest, NextResponse } from 'next/server';

// Mock share storage (in a real app, this would be in a database)
const videoShares: { [key: string]: number } = {
  '1': 156,
  '2': 89,
  '3': 234,
  '4': 78,
  '5': 112,
  '6': 45,
  '7': 67,
  '8': 145
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    if (!videoShares[videoId]) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment share count
    videoShares[videoId] += 1;

    return NextResponse.json({
      success: true,
      videoId,
      shares: videoShares[videoId]
    });

  } catch (error) {
    console.error('Error sharing video:', error);
    return NextResponse.json(
      { error: 'Failed to share video' },
      { status: 500 }
    );
  }
}