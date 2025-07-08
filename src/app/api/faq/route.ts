import { NextRequest, NextResponse } from 'next/server';

// Mock FAQ data
const mockFAQ = {
  explore: [
    {
      id: 1,
      question: "What types can be created?",
      answer: "Our AI can generate cutting videos, water sounds, whisper content, object interactions, and more with realistic 4K visuals.",
      category: "content",
      icon: "ri-palette-line"
    },
    {
      id: 2,
      question: "How fast is generation?",
      answer: "Most videos are generated within 1-2 minutes, ensuring you get high-quality content quickly without long wait times.",
      category: "speed",
      icon: "ri-timer-2-line"
    },
    {
      id: 3,
      question: "Quality advantages?",
      answer: "AI-generated content offers perfect audio-visual sync, consistent quality, and 4K resolution that rivals professional ASMR videos.",
      category: "quality",
      icon: "ri-hd-line"
    },
    {
      id: 4,
      question: "Who benefits most?",
      answer: "Content creators, relaxation enthusiasts, and anyone seeking personalized ASMR experiences benefit from our platform.",
      category: "audience",
      icon: "ri-group-line"
    }
  ],
  general: [
    {
      id: 5,
      question: "Is there a free trial?",
      answer: "Yes, we offer a free tier that allows you to explore our content library and try basic features.",
      category: "pricing",
      icon: "ri-gift-line"
    },
    {
      id: 6,
      question: "How do credits work?",
      answer: "Credits are consumed when generating videos. Each video generation costs 1 credit, and failed generations don't consume credits.",
      category: "credits",
      icon: "ri-coin-line"
    },
    {
      id: 7,
      question: "Can I download videos?",
      answer: "Yes, all generated videos can be downloaded in HD quality for offline viewing and personal use.",
      category: "download",
      icon: "ri-download-line"
    },
    {
      id: 8,
      question: "Is commercial use allowed?",
      answer: "Commercial use is permitted for paid subscribers. Free users can only use content for personal purposes.",
      category: "usage",
      icon: "ri-briefcase-line"
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys');
    
    if (keys) {
      const requestedKeys = keys.split(',');
      const result: { [key: string]: any[] } = {};
      
      requestedKeys.forEach(key => {
        if (mockFAQ[key as keyof typeof mockFAQ]) {
          result[key] = mockFAQ[key as keyof typeof mockFAQ];
        }
      });
      
      return NextResponse.json(result);
    }

    // Return all FAQ data if no specific keys requested
    return NextResponse.json(mockFAQ);

  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ data' },
      { status: 500 }
    );
  }
}