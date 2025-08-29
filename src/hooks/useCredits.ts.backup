import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export interface UserCredits {
  credits: number;
  planType: string;
  totalCreditsSpent: number;
  totalVideosCreated: number;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits>({
    credits: 0,
    planType: 'free',
    totalCreditsSpent: 0,
    totalVideosCreated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits({
        credits: 0,
        planType: 'free',
        totalCreditsSpent: 0,
        totalVideosCreated: 0
      });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    try {
      setError(null);
      
      // Try to get user profile first
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
            credits: 20 // Default free credits
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }
        profile = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      if (profile) {
        setCredits({
          credits: profile.credits || 0,
          planType: profile.plan_type || 'free',
          totalCreditsSpent: profile.total_credits_spent || 0,
          totalVideosCreated: profile.total_videos_created || 0
        });
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
      // Set default values on error to prevent UI blocking
      setCredits({
        credits: 0,
        planType: 'free',
        totalCreditsSpent: 0,
        totalVideosCreated: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deductCredits = async (amount: number, description?: string) => {
    if (!user) return false;

    const supabase = createClient();
    
    try {
      setError(null);

      // Start a transaction to deduct credits and log the transaction
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.credits < amount) {
        throw new Error('Insufficient credits');
      }

      // Update credits
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          credits: profile.credits - amount,
          total_credits_spent: credits.totalCreditsSpent + amount
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'usage',
          amount: -amount,
          description: description || 'Video generation'
        });

      if (transactionError) {
        console.error('Failed to log credit transaction:', transactionError);
      }

      // Update local state
      setCredits(prev => ({
        ...prev,
        credits: prev.credits - amount,
        totalCreditsSpent: prev.totalCreditsSpent + amount
      }));

      return true;
    } catch (err) {
      console.error('Error deducting credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to deduct credits');
      return false;
    }
  };

  const addCredits = async (amount: number, description?: string) => {
    if (!user) return false;

    const supabase = createClient();
    
    try {
      setError(null);

      // Update credits
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          credits: credits.credits + amount
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'purchase',
          amount: amount,
          description: description || 'Credits purchase'
        });

      if (transactionError) {
        console.error('Failed to log credit transaction:', transactionError);
      }

      // Update local state
      setCredits(prev => ({
        ...prev,
        credits: prev.credits + amount
      }));

      return true;
    } catch (err) {
      console.error('Error adding credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to add credits');
      return false;
    }
  };

  const refreshCredits = () => {
    fetchCredits();
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    deductCredits,
    addCredits,
    refreshCredits
  };
};