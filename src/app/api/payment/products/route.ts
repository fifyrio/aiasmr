import { NextRequest, NextResponse } from 'next/server';
import { ALL_PRODUCTS, getCreditPackages, getSubscriptionPlans } from '@/lib/payment/products';

// Force dynamic rendering for API routes that use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let products;
    
    switch (type) {
      case 'credits':
        products = getCreditPackages();
        break;
      case 'subscriptions':
        products = getSubscriptionPlans();
        break;
      default:
        products = ALL_PRODUCTS;
    }

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}