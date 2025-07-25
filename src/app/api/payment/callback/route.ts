import { NextRequest, NextResponse } from 'next/server';
import { createMockPaymentClient } from '@/lib/payment/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkout_id');
    const status = searchParams.get('status');
    const signature = searchParams.get('signature');

    if (!checkoutId) {
      return NextResponse.redirect('/payment/error?message=Missing checkout ID');
    }

    // Verify callback signature (simplified for mock)
    const paymentClient = createMockPaymentClient();
    const params = Object.fromEntries(searchParams.entries());
    delete params.signature; // Remove signature from params for verification
    
    if (signature) {
      const expectedSignature = paymentClient.createCallbackSignature(params);
      if (signature !== expectedSignature) {
        console.error('Invalid signature in payment callback');
        return NextResponse.redirect('/payment/error?message=Invalid signature');
      }
    }

    const supabase = createClient();

    if (status === 'success') {
      // Handle successful payment
      await handlePaymentSuccess(checkoutId, supabase);
      return NextResponse.redirect('/payment/success');
    } else if (status === 'cancel') {
      // Handle cancelled payment
      await handlePaymentCancel(checkoutId, supabase);
      return NextResponse.redirect('/payment/cancel');
    } else {
      return NextResponse.redirect('/payment/error?message=Unknown status');
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect('/payment/error?message=Callback processing failed');
  }
}

async function handlePaymentSuccess(checkoutId: string, supabase: any) {
  try {
    // Find order by checkout ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('checkout_id', checkoutId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Add credits to user account
    const { data: currentUser, error: userError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', order.user_id)
      .single();

    if (!userError && currentUser) {
      const newCredits = (currentUser.credits || 0) + order.credits;
      await supabase
        .from('user_profiles')
        .update({ credits: newCredits })
        .eq('id', order.user_id);
    }

    // If it's a subscription, create subscription record
    if (order.type === 'subscription') {
      const now = new Date();
      const periodEnd = new Date();
      
      // Determine period end based on product
      if (order.product_id.includes('yearly')) {
        periodEnd.setFullYear(now.getFullYear() + 1);
      } else {
        periodEnd.setMonth(now.getMonth() + 1);
      }

      await supabase
        .from('subscriptions')
        .insert({
          user_id: order.user_id,
          product_id: order.product_id,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false
        });
    }

    console.log(`Payment completed for order ${order.id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentCancel(checkoutId: string, supabase: any) {
  try {
    // Update order status to cancelled
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('checkout_id', checkoutId);

    console.log(`Payment cancelled for checkout ${checkoutId}`);
  } catch (error) {
    console.error('Error handling payment cancel:', error);
    throw error;
  }
}