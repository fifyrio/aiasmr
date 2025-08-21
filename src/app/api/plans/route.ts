import { NextRequest, NextResponse } from 'next/server';
import { getPlans } from '@/lib/payment/products';

export async function GET(request: NextRequest) {
  try {
    const plans = getPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Failed to get plans:', error);
    return NextResponse.json(
      { error: 'Failed to load plans' },
      { status: 500 }
    );
  }
}