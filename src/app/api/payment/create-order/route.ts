import { NextRequest, NextResponse } from 'next/server';
import { createMockPaymentClient } from '@/lib/payment/client';
import { createCreemPaymentClient } from '@/lib/payment/creem-client';
import { getProductById } from '@/lib/payment/products';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get product details
    const product = getProductById(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

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
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // 检查是否使用直接支付URL（如Trial计划）
    if (product.directPaymentUrl) {
      // 对于Trial计划，直接跳转到Creem.io支付页面
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: `direct_${order.id}`,
        payment_url: product.directPaymentUrl
      });
    }
    
    // 对于其他计划，使用Creem.io API创建checkout
    try {
      const paymentClient = createCreemPaymentClient();
      const checkout = await paymentClient.createCheckout({
        product_id: product.product_id,
        customer_email: user.email || '',
        success_url: `${baseUrl}/payment/success?order_id=${order.id}`,
        cancel_url: `${baseUrl}/payment/cancel?order_id=${order.id}`,
        metadata: {
          order_id: order.id,
          user_id: user.id
        }
      });
      
      // Update order with checkout ID
      await supabase
        .from('orders')
        .update({ checkout_id: checkout.checkout_id })
        .eq('id', order.id);
        
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: checkout.checkout_id,
        payment_url: checkout.payment_url
      });
    } catch (creem_error) {
      console.error('Creem.io payment failed, falling back to mock:', creem_error);
      
      // 如果Creem.io API失败，回退到mock
      const mockPaymentClient = createMockPaymentClient();
      const checkout = await mockPaymentClient.createCheckout({
        product_id: product.product_id,
        customer_email: user.email || '',
        success_url: `${baseUrl}/payment/success?order_id=${order.id}`,
        cancel_url: `${baseUrl}/payment/cancel?order_id=${order.id}`,
        metadata: {
          order_id: order.id,
          user_id: user.id
        }
      });
      
      // Update order with checkout ID
      await supabase
        .from('orders')
        .update({ checkout_id: checkout.checkout_id })
        .eq('id', order.id);
        
      return NextResponse.json({
        success: true,
        order_id: order.id,
        checkout_id: checkout.checkout_id,
        payment_url: checkout.payment_url
      });
    }

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}