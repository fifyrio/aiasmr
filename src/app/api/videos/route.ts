import { NextRequest, NextResponse } from 'next/server';

// Mock video data
const mockVideos = [
  {
    id: 1,
    title: "Crystal Apple Slicing",
    description: "Satisfying crystal apple cutting with crisp sounds",
    category: "Cutting",
    status: "HOT",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/1",
    likes: 2847,
    shares: 156,
    creator: "AI Generator",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Memory Foam Cutting",
    description: "Smooth knife slicing through memory foam",
    category: "Cutting",
    status: "NEW",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/2",
    likes: 1923,
    shares: 89,
    creator: "AI Generator",
    createdAt: "2024-01-14T15:30:00Z"
  },
  {
    id: 3,
    title: "Honey Dripping",
    description: "Golden honey slowly dripping with ambient sounds",
    category: "Water",
    status: "TRENDING",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/3",
    likes: 3456,
    shares: 234,
    creator: "AI Generator",
    createdAt: "2024-01-13T09:15:00Z"
  },
  {
    id: 4,
    title: "Ice Cube Melting",
    description: "Crystal clear ice cubes melting in warm light",
    category: "Water",
    status: "HOT",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/4",
    likes: 1567,
    shares: 78,
    creator: "AI Generator",
    createdAt: "2024-01-12T14:45:00Z"
  },
  {
    id: 5,
    title: "Soap Cutting",
    description: "Colorful soap bars being cut with precision",
    category: "Cutting",
    status: "NEW",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/5",
    likes: 2134,
    shares: 112,
    creator: "AI Generator",
    createdAt: "2024-01-11T11:20:00Z"
  },
  {
    id: 6,
    title: "Whisper Sounds",
    description: "Gentle whisper sounds with calming visuals",
    category: "Whisper",
    status: "TRENDING",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/6",
    likes: 987,
    shares: 45,
    creator: "AI Generator",
    createdAt: "2024-01-10T16:00:00Z"
  },
  {
    id: 7,
    title: "Rain Drops",
    description: "Peaceful rain drops on glass surface",
    category: "Water",
    status: "NEW",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/7",
    likes: 1456,
    shares: 67,
    creator: "AI Generator",
    createdAt: "2024-01-09T08:30:00Z"
  },
  {
    id: 8,
    title: "Sand Cutting",
    description: "Kinetic sand being cut with various tools",
    category: "Object",
    status: "HOT",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/8",
    likes: 2789,
    shares: 145,
    creator: "AI Generator",
    createdAt: "2024-01-08T13:15:00Z"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '6');

    let filteredVideos = mockVideos;

    // Apply search filter
    if (search) {
      filteredVideos = filteredVideos.filter(video =>
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category && category !== 'All') {
      filteredVideos = filteredVideos.filter(video => video.category === category);
    }

    // Apply status filter
    if (status && status !== 'All') {
      filteredVideos = filteredVideos.filter(video => video.status === status);
    }

    // Apply pagination
    const paginatedVideos = filteredVideos.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredVideos.length;

    return NextResponse.json({
      videos: paginatedVideos,
      total: filteredVideos.length,
      hasMore,
      offset: offset + limit
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}