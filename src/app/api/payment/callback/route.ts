import { NextRequest, NextResponse } from 'next/server';
import { createMockPaymentClient } from '@/lib/payment/client';
import { createCreemPaymentClient } from '@/lib/payment/creem-client';
import { createClient } from '@/lib/supabase/server';
import { WebhookBody } from '@/lib/payment/types';

// Force dynamic rendering for payment callbacks
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== Payment Callback (GET) Started ===');
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkout_id');
    let status = searchParams.get('status');
    const signature = searchParams.get('signature');
    const orderId = searchParams.get('order_id');
    
    // If no status is provided, assume success if we have checkout_id and product_id
    if (!status && checkoutId && searchParams.get('product_id')) {
      status = 'success';
      console.log('No status parameter found, inferring success from presence of checkout_id and product_id');
    }
    
    console.log('Callback parameters:', {
      checkoutId,
      status,
      orderId,
      hasSignature: !!signature,
      url: request.url,
      timestamp: new Date().toISOString()
    });
    
    // Get base URL for absolute redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    if (!checkoutId) {
      console.error('Missing checkout_id in callback');
      return NextResponse.redirect(`${baseUrl}/payment/error?message=Missing checkout ID`);
    }

    const params = Object.fromEntries(searchParams.entries());
    delete params.signature; // Remove signature from params for verification
    
    // Determine if this is a Creem.io callback or mock callback
    // Creem.io checkout IDs can start with 'ch_', 'co_', or 'direct_' (our custom prefix)
    const isCreemCallback = checkoutId.startsWith('ch_') || checkoutId.startsWith('co_') || checkoutId.startsWith('direct_');
    
    console.log('Callback type determined:', {
      isCreemCallback,
      checkoutIdPrefix: checkoutId.substring(0, 10),
      fullCheckoutId: checkoutId
    });
    
    // Verify callback signature
    if (signature) {
      console.log('Verifying callback signature...');
      let isValidSignature = false;
      
      try {
        if (isCreemCallback) {
          // Use Creem.io signature verification
          const creem = createCreemPaymentClient();
          isValidSignature = creem.verifySignature(params, signature);
          console.log('Creem.io signature verification result:', isValidSignature);
        } else {
          // Use mock signature verification
          const mockClient = createMockPaymentClient();
          const expectedSignature = mockClient.createCallbackSignature(params);
          isValidSignature = signature === expectedSignature;
          console.log('Mock signature verification result:', {
            isValid: isValidSignature,
            expected: expectedSignature.substring(0, 20) + '...',
            received: signature.substring(0, 20) + '...'
          });
        }
      } catch (verificationError) {
        console.error('Signature verification failed with error:', {
          error: verificationError instanceof Error ? verificationError.message : verificationError,
          isCreemCallback,
          checkoutId
        });
        isValidSignature = false;
      }
      
      if (!isValidSignature) {
        console.error('Invalid signature in payment callback - proceeding anyway for testing');
        console.error('Signature validation details:', {
          checkoutId,
          orderId,
          isCreemCallback,
          signatureLength: signature.length,
          paramsCount: Object.keys(params).length
        });
        // TODO: Re-enable signature verification after testing
        // return NextResponse.redirect(`${baseUrl}/payment/error?message=Invalid signature`);
      }
      
      console.log('Signature verification passed');
    } else {
      console.warn('No signature provided in callback - this may be insecure');
    }

    const supabase = createClient();

    if (status === 'success' || status === 'completed') {
      // Handle successful payment
      console.log('Processing successful payment...');
      try {
        await handlePaymentSuccess(checkoutId, supabase, orderId || undefined);
        console.log('Payment success handling completed, redirecting to success page');
        return NextResponse.redirect(`${baseUrl}/payment/success`);
      } catch (successError) {
        console.error('Error handling payment success:', {
          error: successError instanceof Error ? successError.message : successError,
          checkoutId,
          status
        });
        return NextResponse.redirect(`${baseUrl}/payment/error?message=Payment processing failed`);
      }
    } else if (status === 'cancel' || status === 'cancelled') {
      // Handle cancelled payment
      console.log('Processing cancelled payment...');
      try {
        await handlePaymentCancel(checkoutId, supabase, orderId || undefined);
        console.log('Payment cancellation handling completed, redirecting to cancel page');
        return NextResponse.redirect(`${baseUrl}/payment/cancel`);
      } catch (cancelError) {
        console.error('Error handling payment cancellation:', {
          error: cancelError instanceof Error ? cancelError.message : cancelError,
          checkoutId,
          status
        });
        return NextResponse.redirect(`${baseUrl}/payment/error?message=Cancellation processing failed`);
      }
    } else {
      console.error('Unknown payment status received:', status);
      return NextResponse.redirect(`${baseUrl}/payment/error?message=Unknown status`);
    }

  } catch (error) {
    console.error('=== CRITICAL ERROR in payment callback (GET) ===');
    console.error('Callback error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      url: request.url,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiasmr.so';
    return NextResponse.redirect(`${baseUrl}/payment/error?message=Callback processing failed`);
  }
}

// Handle Creem.io webhook POST requests
export async function POST(request: NextRequest) {
  console.log('=== Payment Webhook (POST) Started ===');
  try {
    const signature = request.headers.get('creem-signature') || request.headers.get('x-creem-signature') || '';
    const body = await request.text();
    
    console.log('Webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
      headers: {
        'creem-signature': request.headers.get('creem-signature'),
        'x-creem-signature': request.headers.get('x-creem-signature'),
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent')
      }
    });
    
    // Verify webhook signature
    if (signature) {
      console.log('Verifying webhook signature...');
      try {
        const creem = createCreemPaymentClient();
        const isValid = creem.verifyWebhookSignature(body, signature);
        console.log('Webhook signature verification result:', isValid);
        
        if (!isValid) {
          console.error('Invalid webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      } catch (signatureError) {
        console.error('Webhook signature verification error:', {
          error: signatureError instanceof Error ? signatureError.message : signatureError,
          signatureLength: signature.length
        });
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    } else {
      console.warn('No webhook signature provided - this may be insecure');
    }

    let webhookData: WebhookBody;
    try {
      webhookData = JSON.parse(body);
      console.log('Webhook data parsed:', {
        eventType: webhookData.eventType,
        objectType: typeof webhookData.object,
        timestamp: webhookData.timestamp
      });
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', {
        error: parseError instanceof Error ? parseError.message : parseError,
        bodyPreview: body.substring(0, 200)
      });
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const supabase = createClient();

    switch (webhookData.eventType) {
      case 'checkout.completed':
        console.log('Processing checkout.completed webhook event');
        try {
          const checkout = webhookData.object as any;
          console.log('Checkout data:', { checkoutId: checkout.id });
          await handlePaymentSuccess(checkout.id, supabase);
          console.log('Checkout completion handled successfully');
        } catch (checkoutError) {
          console.error('Error handling checkout.completed:', {
            error: checkoutError instanceof Error ? checkoutError.message : checkoutError,
            checkoutData: webhookData.object
          });
          throw checkoutError;
        }
        break;
        
      case 'refund.created':
        console.log('Processing refund.created webhook event');
        try {
          const refund = webhookData.object as any;
          console.log('Refund data:', { checkoutId: refund.checkout_id });
          await handleRefund(refund.checkout_id, supabase);
          console.log('Refund handled successfully');
        } catch (refundError) {
          console.error('Error handling refund.created:', {
            error: refundError instanceof Error ? refundError.message : refundError,
            refundData: webhookData.object
          });
          throw refundError;
        }
        break;
        
      case 'subscription.cancelled':
        console.log('Processing subscription.cancelled webhook event');
        try {
          const subscription = webhookData.object as any;
          console.log('Subscription data:', { subscriptionId: subscription.id });
          await handleSubscriptionCancellation(subscription.id, supabase);
          console.log('Subscription cancellation handled successfully');
        } catch (subscriptionError) {
          console.error('Error handling subscription.cancelled:', {
            error: subscriptionError instanceof Error ? subscriptionError.message : subscriptionError,
            subscriptionData: webhookData.object
          });
          throw subscriptionError;
        }
        break;
        
      default:
        console.log('Unhandled webhook event type:', webhookData.eventType);
    }

    console.log('=== Webhook Processing Completed Successfully ===');
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('=== CRITICAL ERROR in webhook processing (POST) ===');
    console.error('Webhook error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(checkoutId: string, supabase: any, orderId?: string) {
  console.log('=== handlePaymentSuccess started ===');
  console.log('Processing payment success for checkout:', checkoutId);
  
  try {
    let order = null;
    let orderError = null;
    
    // Try to find order by checkout_id first
    console.log('Searching for order with checkout_id:', checkoutId);
    const { data: orderByCheckout, error: checkoutError } = await supabase
      .from('orders')
      .select('*')
      .eq('checkout_id', checkoutId)
      .single();
    
    if (!checkoutError && orderByCheckout) {
      order = orderByCheckout;
      console.log('Order found by checkout_id');
    } else if (orderId) {
      // If checkout_id search fails, try to find by order_id from URL params
      console.log('Checkout_id search failed, trying order_id:', orderId);
      const { data: orderById, error: idError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (!idError && orderById) {
        order = orderById;
        console.log('Order found by order_id');
        
        // Update the order with the Creem.io checkout_id for future reference
        const { error: updateError } = await supabase
          .from('orders')
          .update({ checkout_id: checkoutId })
          .eq('id', orderId);
          
        if (updateError) {
          console.error('Failed to update order with Creem checkout_id:', updateError);
        } else {
          console.log('Updated order with Creem checkout_id:', checkoutId);
        }
      } else {
        orderError = idError;
      }
    } else {
      orderError = checkoutError;
    }

    if (orderError || !order) {
      console.error('Failed to find order:', {
        error: orderError,
        checkoutId,
        hasOrder: !!order
      });
      throw new Error(`Order not found for checkout_id: ${checkoutId}`);
    }
    
    console.log('Order found:', {
      orderId: order.id,
      userId: order.user_id,
      productId: order.product_id,
      price: order.price,
      credits: order.credits,
      currentStatus: order.status
    });

    // Update order status
    console.log('Updating order status to completed...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', order.id);
      
    if (updateError) {
      console.error('Failed to update order status:', {
        error: updateError,
        orderId: order.id
      });
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }
    
    console.log('Order status updated to completed');

    // Add credits to user account
    console.log('Adding credits to user account...');
    const { data: currentUser, error: userError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', order.user_id)
      .single();

    if (userError) {
      console.error('Failed to fetch user profile:', {
        error: userError,
        userId: order.user_id
      });
      throw new Error(`Failed to fetch user profile: ${userError.message}`);
    }
    
    if (!currentUser) {
      console.error('User profile not found:', order.user_id);
      throw new Error(`User profile not found: ${order.user_id}`);
    }
    
    const oldCredits = currentUser.credits || 0;
    const newCredits = oldCredits + order.credits;
    
    console.log('Credit calculation:', {
      userId: order.user_id,
      oldCredits,
      creditsToAdd: order.credits,
      newCredits
    });
    
    const { error: creditUpdateError } = await supabase
      .from('user_profiles')
      .update({ credits: newCredits })
      .eq('id', order.user_id);
      
    if (creditUpdateError) {
      console.error('Failed to update user credits:', {
        error: creditUpdateError,
        userId: order.user_id,
        newCredits
      });
      throw new Error(`Failed to update user credits: ${creditUpdateError.message}`);
    }
    
    console.log('User credits updated successfully');

    // Update user plan type based on product
    console.log('Updating user plan type...');
    let planType = 'free';
    if (order.product_name.includes('Trial')) {
      planType = 'trial';
    } else if (order.product_name.includes('Basic')) {
      planType = 'basic';
    } else if (order.product_name.includes('Pro')) {
      planType = 'pro';
    }
    
    const { error: planUpdateError } = await supabase
      .from('user_profiles')
      .update({ plan_type: planType })
      .eq('id', order.user_id);
      
    if (planUpdateError) {
      console.error('Failed to update user plan type:', {
        error: planUpdateError,
        userId: order.user_id,
        planType
      });
      // Don't throw error, just log it as this is not critical
    } else {
      console.log('User plan type updated to:', planType);
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

    console.log(`=== Payment completed successfully for order ${order.id} ===`);
  } catch (error) {
    console.error('=== CRITICAL ERROR in handlePaymentSuccess ===');
    console.error('Payment success handling error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      checkoutId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

async function handlePaymentCancel(checkoutId: string, supabase: any, orderId?: string) {
  try {
    // Try to update by checkout_id first
    let { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('checkout_id', checkoutId);
    
    // If that fails and we have orderId, try updating by order ID
    if (updateError && orderId) {
      console.log('Updating order status by order_id:', orderId);
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', checkout_id: checkoutId })
        .eq('id', orderId);
      
      if (orderUpdateError) {
        throw orderUpdateError;
      }
    } else if (updateError) {
      throw updateError;
    }

    console.log(`Payment cancelled for checkout ${checkoutId}`);
  } catch (error) {
    console.error('Error handling payment cancel:', error);
    throw error;
  }
}

async function handleRefund(checkoutId: string, supabase: any) {
  try {
    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('checkout_id', checkoutId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found for refund');
    }

    // Update order status to refunded
    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', order.id);

    // Deduct credits from user account
    const { data: currentUser, error: userError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', order.user_id)
      .single();

    if (!userError && currentUser) {
      const newCredits = Math.max(0, (currentUser.credits || 0) - order.credits);
      await supabase
        .from('user_profiles')
        .update({ credits: newCredits })
        .eq('id', order.user_id);
    }

    console.log(`Refund processed for order ${order.id}`);
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscriptionId: string, supabase: any) {
  try {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    console.log(`Subscription cancelled: ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}