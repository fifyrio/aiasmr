import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export interface UserSubscription {
  id?: string;
  productName: string;
  status: 'active' | 'cancelled' | 'expired' | 'none';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  planType: 'free' | 'trial' | 'basic' | 'pro';
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    productName: 'Free Plan',
    status: 'none',
    planType: 'free'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({
        productName: 'Free Plan',
        status: 'none',
        planType: 'free'
      });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    try {
      setError(null);
      
      // Get user profile for plan type
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Get active subscription
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
      }

      const activeSubscription = subscriptions?.[0];
      const planType = profile?.plan_type || 'free';

      if (activeSubscription) {
        // Map plan type to product name
        let productName = 'Unknown Plan';
        switch (planType) {
          case 'trial':
            productName = 'AI ASMR Trial';
            break;
          case 'basic':
            productName = 'AI ASMR Basic';
            break;
          case 'pro':
            productName = 'AI ASMR Pro';
            break;
          default:
            productName = 'Free Plan';
        }

        setSubscription({
          id: activeSubscription.id,
          productName: productName,
          status: activeSubscription.status as any,
          currentPeriodStart: activeSubscription.current_period_start,
          currentPeriodEnd: activeSubscription.current_period_end,
          cancelledAt: activeSubscription.cancelled_at,
          planType: planType as any
        });
      } else {
        // No active subscription, use plan_type from user_profiles and get recent order info
        const { data: recentOrders, error: orderError } = await supabase
          .from('orders')
          .select('product_name, status, created_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (orderError) {
          console.error('Error fetching recent orders:', orderError);
        }

        const recentOrder = recentOrders?.[0];

        // Use planType from user_profiles (already fetched above)
        let productName = 'Free Plan';
        let status: UserSubscription['status'] = 'none';

        // Map plan_type to product name
        switch (planType) {
          case 'trial':
            productName = 'AI ASMR Trial';
            status = 'active';
            break;
          case 'basic':
            productName = 'AI ASMR Basic';
            status = 'active';
            break;
          case 'pro':
            productName = 'AI ASMR Pro';
            status = 'active';
            break;
          default:
            productName = 'Free Plan';
            status = 'none';
        }

        // If user has a plan but also has recent orders, prioritize order product name
        if (recentOrder && recentOrder.product_name && planType !== 'free') {
          productName = recentOrder.product_name;
        }

        setSubscription({
          productName,
          status,
          planType: planType as any // Use planType from user_profiles
        });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription({
        productName: 'Free Plan',
        status: 'none',
        planType: 'free'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshSubscription = () => {
    fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refreshSubscription
  };
};