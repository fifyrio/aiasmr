import { NextRequest, NextResponse } from 'next/server';
import { createMockPaymentClient } from '@/lib/payment/client';
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
      credits: product.credits,
      hasDirectPaymentUrl: !!product.directPaymentUrl
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
    
    // 检查是否使用直接支付URL（如Trial计划）
    if (product.directPaymentUrl) {
      console.log('Using direct payment URL for product:', product.product_id);
      
      // 生成唯一的checkout_id并更新订单
      const checkoutId = `direct_${order.id}_${Date.now()}`;
      console.log('Generated checkout_id:', checkoutId);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ checkout_id: checkoutId })
        .eq('id', order.id);
        
      if (updateError) {
        console.error('Failed to update order with checkout_id:', {
          error: updateError,
          orderId: order.id,
          checkoutId: checkoutId
        });
      }
      
      // 构建包含回调参数的支付URL
      const successUrl = `${baseUrl}/api/payment/callback?status=success&checkout_id=${checkoutId}&order_id=${order.id}`;
      const cancelUrl = `${baseUrl}/api/payment/callback?status=cancel&checkout_id=${checkoutId}&order_id=${order.id}`;
      
      console.log('Callback URLs generated:', {
        successUrl,
        cancelUrl
      });
      
      // 如果支付URL支持自定义回调参数，添加它们
      const paymentUrl = new URL(product.directPaymentUrl);
      paymentUrl.searchParams.set('success_url', successUrl);
      paymentUrl.searchParams.set('cancel_url', cancelUrl);
      paymentUrl.searchParams.set('customer_email', user.email || '');
      paymentUrl.searchParams.set('order_id', order.id);
      
      console.log('Final payment URL:', paymentUrl.toString());
      console.log('=== Direct Payment Order Creation Completed ===');
      
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: checkoutId,
        payment_url: paymentUrl.toString()
      });
    }
    
    // 对于其他计划，使用Creem.io API创建checkout
    console.log('Using Creem.io API for checkout creation');
    try {
      const paymentClient = createCreemPaymentClient();
      const checkoutRequest = {
        product_id: product.product_id,
        customer_email: user.email || '',
        success_url: `${baseUrl}/payment/success?order_id=${order.id}`,
        cancel_url: `${baseUrl}/payment/cancel?order_id=${order.id}`,
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
      
      console.log('=== Creem.io API Order Creation Completed ===');
        
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: checkout.checkout_id,
        payment_url: checkout.payment_url
      });
    } catch (creem_error) {
      console.error('Creem.io payment failed, falling back to mock:', {
        error: creem_error instanceof Error ? {
          message: creem_error.message,
          stack: creem_error.stack
        } : creem_error,
        productId: product.product_id,
        orderId: order.id,
        timestamp: new Date().toISOString()
      });
      
      // 如果Creem.io API失败，回退到mock
      console.log('Falling back to mock payment system');
      
      const mockPaymentClient = createMockPaymentClient();
      const mockCheckout = await mockPaymentClient.createCheckout({
        product_id: product.product_id,
        customer_email: user.email || '',
        success_url: `${baseUrl}/payment/success?order_id=${order.id}`,
        cancel_url: `${baseUrl}/payment/cancel?order_id=${order.id}`,
        metadata: {
          order_id: order.id,
          user_id: user.id
        }
      });
      
      console.log('Mock payment checkout created:', {
        checkoutId: mockCheckout.checkout_id,
        paymentUrl: mockCheckout.payment_url
      });
      
      // Update order with checkout ID
      const { error: mockUpdateError } = await supabase
        .from('orders')
        .update({ checkout_id: mockCheckout.checkout_id })
        .eq('id', order.id);
        
      if (mockUpdateError) {
        console.error('Failed to update order with mock checkout_id:', {
          error: mockUpdateError,
          orderId: order.id,
          checkoutId: mockCheckout.checkout_id
        });
      }
      
      console.log('=== Mock Payment Order Creation Completed ===');
        
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: mockCheckout.checkout_id,
        payment_url: mockCheckout.payment_url
      });
    }

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