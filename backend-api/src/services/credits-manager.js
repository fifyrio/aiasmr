const { createSupabaseClient } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Credits Manager Service
 * Handles all credit-related operations including deduction, refunds, and balance queries
 */

/**
 * Deduct credits from user account
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to deduct
 * @param {string} description - Description of the transaction
 * @param {string} [taskId] - Optional task ID for tracking
 * @returns {Promise<Object>} Result with success status and remaining credits
 */
const deductCredits = async (userId, amount, description, taskId) => {
  try {
    const supabase = createSupabaseClient();

    // Start transaction - get current credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, total_credits_spent, total_videos_created')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('Error fetching user profile', { userId, error: profileError });
      return { success: false, error: 'Failed to fetch user profile' };
    }

    if (!profile) {
      logger.warn('User profile not found', { userId });
      return { success: false, error: 'User profile not found' };
    }

    if (profile.credits < amount) {
      logger.warn('Insufficient credits', { 
        userId, 
        requested: amount, 
        available: profile.credits 
      });
      return { success: false, error: 'Insufficient credits' };
    }

    // Update user credits
    const newCredits = profile.credits - amount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        credits: newCredits,
        total_credits_spent: (profile.total_credits_spent || 0) + amount,
        total_videos_created: (profile.total_videos_created || 0) + 1
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error updating user credits', { userId, error: updateError });
      return { success: false, error: 'Failed to update credits' };
    }

    // Log credit transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'usage',
        amount: -amount,
        description: taskId ? `${description} - Task: ${taskId}` : description,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      logger.error('Error logging credit transaction', { 
        userId, 
        amount, 
        error: transactionError 
      });
      // Don't fail the operation if transaction logging fails
    }

    logger.info('Credits deducted successfully', { 
      userId, 
      amount, 
      remainingCredits: newCredits,
      taskId 
    });
    
    return { success: true, remainingCredits: newCredits };

  } catch (error) {
    logger.error('Error in deductCredits', { userId, amount, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Refund credits to user account (for failed generations)
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to refund
 * @param {string} description - Description of the refund
 * @param {string} [taskId] - Optional task ID for tracking
 * @param {string} [videoId] - Optional video ID for tracking
 * @returns {Promise<Object>} Result with success status and new credit balance
 */
const refundCredits = async (userId, amount, description, taskId, videoId) => {
  try {
    const supabase = createSupabaseClient();

    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, total_credits_spent')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Error fetching user profile for refund', { userId, error: profileError });
      return { success: false, error: 'Failed to fetch user profile' };
    }

    // Update user credits (add back the amount)
    const newCredits = profile.credits + amount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        credits: newCredits,
        // Optionally decrease total_credits_spent if you want to track net spending
        total_credits_spent: Math.max(0, (profile.total_credits_spent || 0) - amount)
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error updating user credits for refund', { userId, error: updateError });
      return { success: false, error: 'Failed to refund credits' };
    }

    // Log refund transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        video_id: videoId || null,
        transaction_type: 'refund',
        amount: amount, // Positive amount for refunds
        description: taskId ? `${description} - Task: ${taskId}` : description,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      logger.error('Error logging refund transaction', { 
        userId, 
        amount, 
        error: transactionError 
      });
      // Don't fail the operation if transaction logging fails
    }

    logger.info('Credits refunded successfully', { 
      userId, 
      amount, 
      newCredits,
      taskId,
      videoId 
    });
    
    return { success: true, newCredits };

  } catch (error) {
    logger.error('Error in refundCredits', { userId, amount, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Get user's current credit balance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Credits balance and error if any
 */
const getUserCredits = async (userId) => {
  try {
    const supabase = createSupabaseClient();
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      logger.error('Error fetching user credits', { userId, error });
      return { credits: 0, error: 'Failed to fetch credits' };
    }

    return { credits: profile.credits || 0 };

  } catch (error) {
    logger.error('Error in getUserCredits', { userId, error: error.message });
    return { credits: 0, error: error.message };
  }
};

/**
 * Get user's credit transaction history
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Maximum number of transactions to return
 * @param {number} [offset=0] - Number of transactions to skip
 * @returns {Promise<Object>} Transaction history and error if any
 */
const getCreditHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const supabase = createSupabaseClient();
    
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching credit history', { userId, error });
      return { transactions: [], error: 'Failed to fetch credit history' };
    }

    return { transactions: transactions || [] };

  } catch (error) {
    logger.error('Error in getCreditHistory', { userId, error: error.message });
    return { transactions: [], error: error.message };
  }
};

/**
 * Record a successful video completion (updates transaction with video_id)
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Success status and error if any
 */
const recordVideoCompletion = async (userId, taskId, videoId) => {
  try {
    const supabase = createSupabaseClient();

    // Update the credit transaction with the video_id
    const { error: updateError } = await supabase
      .from('credit_transactions')
      .update({ 
        video_id: videoId,
        description: `Video generation completed - Task: ${taskId}, Video: ${videoId}`
      })
      .eq('user_id', userId)
      .eq('transaction_type', 'usage')
      .like('description', `%Task: ${taskId}%`)
      .is('video_id', null); // Only update if video_id is not set yet

    if (updateError) {
      logger.error('Error updating credit transaction with video_id', { 
        userId, 
        taskId, 
        videoId, 
        error: updateError 
      });
      return { success: false, error: 'Failed to update transaction record' };
    }

    logger.info('Updated credit transaction for video completion', { 
      userId, 
      taskId, 
      videoId 
    });
    return { success: true };

  } catch (error) {
    logger.error('Error in recordVideoCompletion', { 
      userId, 
      taskId, 
      videoId, 
      error: error.message 
    });
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has sufficient credits for a specific operation
 * @param {string} userId - User ID
 * @param {number} duration - Video duration (5 or 8 seconds)
 * @param {string} quality - Video quality ('720p' or '1080p')
 * @returns {Promise<Object>} Check result with cost and available credits
 */
const checkUserCredits = async (userId, duration, quality) => {
  try {
    // Define generation costs
    const GENERATION_COSTS = {
      '5s_720p': 20,
      '5s_1080p': 25,
      '8s_720p': 30,
      // 8s_1080p not supported
    };
    
    const costKey = `${duration}s_${quality}`;
    const cost = GENERATION_COSTS[costKey];
    
    if (!cost) {
      return { 
        success: false, 
        error: `Invalid duration/quality combination: ${duration}s ${quality}` 
      };
    }
    
    const { credits, error } = await getUserCredits(userId);
    
    if (error) {
      return { success: false, error };
    }
    
    if (credits < cost) {
      return { 
        success: false, 
        error: `Insufficient credits. Required: ${cost}, Available: ${credits}`,
        cost,
        availableCredits: credits
      };
    }
    
    return { 
      success: true, 
      cost, 
      availableCredits: credits 
    };

  } catch (error) {
    logger.error('Error in checkUserCredits', { 
      userId, 
      duration, 
      quality, 
      error: error.message 
    });
    return { success: false, error: error.message };
  }
};

/**
 * Add credits to user account (for purchases or bonuses)
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to add
 * @param {string} transactionType - Type of transaction ('purchase' or 'bonus')
 * @param {string} description - Description of the transaction
 * @param {string} [subscriptionId] - Optional subscription ID for tracking
 * @returns {Promise<Object>} Result with success status and new credit balance
 */
const addCredits = async (userId, amount, transactionType, description, subscriptionId) => {
  try {
    const supabase = createSupabaseClient();

    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Error fetching user profile for credit addition', { userId, error: profileError });
      return { success: false, error: 'Failed to fetch user profile' };
    }

    // Update user credits (add the amount)
    const newCredits = profile.credits + amount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error updating user credits for addition', { userId, error: updateError });
      return { success: false, error: 'Failed to add credits' };
    }

    // Log credit transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId || null,
        transaction_type: transactionType,
        amount: amount, // Positive amount for additions
        description: description,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      logger.error('Error logging credit addition transaction', { 
        userId, 
        amount, 
        error: transactionError 
      });
      // Don't fail the operation if transaction logging fails
    }

    logger.info('Credits added successfully', { 
      userId, 
      amount, 
      transactionType,
      newCredits 
    });
    
    return { success: true, newCredits };

  } catch (error) {
    logger.error('Error in addCredits', { userId, amount, error: error.message });
    return { success: false, error: error.message };
  }
};

module.exports = {
  deductCredits,
  refundCredits,
  getUserCredits,
  getCreditHistory,
  recordVideoCompletion,
  checkUserCredits,
  addCredits
};