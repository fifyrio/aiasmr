import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.url
export const dynamic = 'force-dynamic';

// Mock testimonials data
const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    username: "@sarahc_relaxation",
    avatar: "/api/placeholder/avatar/1",
    comment: "The AI-generated ASMR videos are incredibly realistic and helped me relax after stressful days. The quality is amazing!",
    rating: 5,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Mike Johnson",
    username: "@mikej_asmr",
    avatar: "/api/placeholder/avatar/2",
    comment: "As a content creator, this platform saves me hours of work. The AI understands exactly what makes good ASMR content.",
    rating: 5,
    createdAt: "2024-01-14T15:30:00Z"
  },
  {
    id: 3,
    name: "Wei Zhang",
    username: "@weizhang_creator",
    avatar: "/api/placeholder/avatar/3",
    comment: "The variety of triggers and the 4K quality make this my go-to platform for ASMR content. Highly recommended!",
    rating: 5,
    createdAt: "2024-01-13T09:15:00Z"
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    username: "@emily_asmr",
    avatar: "/api/placeholder/avatar/4",
    comment: "I've been using this for months and it never fails to deliver exactly what I need for my relaxation routine.",
    rating: 5,
    createdAt: "2024-01-12T14:45:00Z"
  },
  {
    id: 5,
    name: "David Kim",
    username: "@david_sounds",
    avatar: "/api/placeholder/avatar/5",
    comment: "The AI technology is impressive. The videos feel natural and the sound quality is professional grade.",
    rating: 5,
    createdAt: "2024-01-11T11:20:00Z"
  },
  {
    id: 6,
    name: "Lisa Thompson",
    username: "@lisa_relax",
    avatar: "/api/placeholder/avatar/6",
    comment: "Perfect for creating custom ASMR content. The generation speed is fantastic and results are always high quality.",
    rating: 5,
    createdAt: "2024-01-10T16:00:00Z"
  },
  {
    id: 7,
    name: "Alex Turner",
    username: "@alex_asmr_pro",
    avatar: "/api/placeholder/avatar/7",
    comment: "This platform revolutionized my ASMR content creation workflow. The AI generates exactly what I envision.",
    rating: 5,
    createdAt: "2024-01-09T08:30:00Z"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Shuffle testimonials for variety
    const shuffledTestimonials = [...mockTestimonials].sort(() => Math.random() - 0.5);
    
    // Apply pagination
    const paginatedTestimonials = shuffledTestimonials.slice(offset, offset + limit);

    return NextResponse.json({
      testimonials: paginatedTestimonials,
      total: mockTestimonials.length,
      hasMore: offset + limit < mockTestimonials.length
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}