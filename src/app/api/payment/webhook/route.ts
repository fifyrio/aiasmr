import { NextRequest, NextResponse } from 'next/server';
import { createMockPaymentClient } from '@/lib/payment/client';
import { createClient } from '@/lib/supabase/server';
import { WebhookBody } from '@/lib/payment/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-timestamp') || Date.now().toString();
    const signature = request.headers.get('x-signature') || '';

    // Verify webhook signature
    const paymentClient = createMockPaymentClient();
    if (!paymentClient.verifyWebhookSignature(body, timestamp, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhookData: WebhookBody = JSON.parse(body);
    const { eventType, object } = webhookData;

    console.log(`Received webhook: ${eventType}`);

    const supabase = createClient();

    switch (eventType) {
      case 'checkout.completed':
        await handleCheckoutCompleted(object as any, supabase);
        break;
      
      case 'refund.created':
        await handleRefundCreated(object as any, supabase);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(object as any, supabase);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(checkout: any, supabase: any) {
  try {
    // This is similar to the callback handler but triggered by webhook
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('checkout_id', checkout.id)
      .single();

    if (order && order.status === 'pending') {
      // Update order status
      await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      console.log(`Webhook: Order ${order.id} completed`);
    }
  } catch (error) {
    console.error('Error handling checkout completed webhook:', error);
  }
}

async function handleRefundCreated(refund: any, supabase: any) {
  try {
    // Find order by checkout ID
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('checkout_id', refund.checkout_id)
      .single();

    if (order) {
      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', order.id);

      // Deduct credits from user (if any remaining)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('id', order.user_id)
        .single();

      if (userProfile && userProfile.credits > 0) {
        const newCredits = Math.max(0, userProfile.credits - order.credits);
        await supabase
          .from('user_profiles')
          .update({ credits: newCredits })
          .eq('id', order.user_id);
      }

      // Cancel subscription if applicable
      if (order.type === 'subscription') {
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('product_id', order.product_id)
          .eq('user_id', order.user_id)
          .eq('status', 'active');
      }

      console.log(`Webhook: Refund processed for order ${order.id}`);
    }
  } catch (error) {
    console.error('Error handling refund webhook:', error);
  }
}

async function handleSubscriptionCancelled(subscription: any, supabase: any) {
  try {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_at_period_end: true
      })
      .eq('id', subscription.id);

    console.log(`Webhook: Subscription ${subscription.id} cancelled`);
  } catch (error) {
    console.error('Error handling subscription cancelled webhook:', error);
  }
}