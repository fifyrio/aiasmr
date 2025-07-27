import { NextRequest, NextResponse } from 'next/server';
import { createCreemPaymentClient } from '@/lib/payment/creem-client';
import { getProductById } from '@/lib/payment/products';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('=== Payment Order Creation Started ===');
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { product_id } = body;

    if (!product_id) {
      console.error('Missing product_id in request');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Creating order for product:', product_id);

    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication failed:', {
        authError: authError?.message || 'No error details',
        hasUser: !!user,
        userId: user?.id || 'No user ID'
      });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', {
      userId: user.id,
      email: user.email
    });

    // Get product details
    const product = getProductById(product_id);
    if (!product) {
      console.error('Product not found:', {
        requestedProductId: product_id,
        availableProducts: process.env.NODE_ENV === 'development' ? 
          ['prod_4U52gw2XCmcajBDwu6Ru6G', 'prod_4oJ0n9ZOU0x2Tn9rQ1oDJ5', 'prod_5H9ctZ7GUs425KayUilncU'] : 
          'hidden in production'
      });
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('Product found:', {
      productId: product.product_id,
      productName: product.product_name,
      price: product.price,
      credits: product.credits
    });

    // Create order record in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        credits: product.credits,
        type: product.type,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', {
        error: orderError,
        productId: product.product_id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    console.log('Order created successfully:', {
      orderId: order.id,
      productId: order.product_id,
      userId: order.user_id,
      price: order.price,
      credits: order.credits
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // 使用 Creem.io API 创建 checkout
    console.log('Creating Creem.io checkout...');
    const paymentClient = createCreemPaymentClient();
    const checkoutRequest = {
      product_id: product.product_id,
      customer_email: user.email || '',
      success_url: `${baseUrl}/api/payment/callback?order_id=${order.id}`,
      cancel_url: `${baseUrl}/api/payment/callback?status=cancel&order_id=${order.id}`,
      metadata: {
        order_id: order.id,
        user_id: user.id
      }
    };
    
    console.log('Creem.io checkout request:', JSON.stringify(checkoutRequest, null, 2));
    
    const checkout = await paymentClient.createCheckout(checkoutRequest);
    
    console.log('Creem.io checkout response:', {
      checkoutId: checkout.checkout_id,
      paymentUrl: checkout.payment_url,
      status: checkout.status
    });
    
    // Update order with checkout ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ checkout_id: checkout.checkout_id })
      .eq('id', order.id);
      
    if (updateError) {
      console.error('Failed to update order with Creem checkout_id:', {
        error: updateError,
        orderId: order.id,
        checkoutId: checkout.checkout_id
      });
    }
    
    console.log('=== Creem.io Checkout Creation Completed ===');
      
    return NextResponse.json({
      success: true,
      order_id: order.id,
      checkout_id: checkout.checkout_id,
      payment_url: checkout.payment_url
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in create-order ===');
    console.error('Error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.url
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}