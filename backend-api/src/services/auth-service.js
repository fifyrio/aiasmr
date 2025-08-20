const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createSupabaseClient } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authentication Service
 * Handles user authentication, JWT token generation, and user management
 */

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    return null;
  }
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} [profile={}] - Additional profile data
 * @returns {Promise<Object>} Registration result
 */
const registerUser = async (email, password, profile = {}) => {
  try {
    const supabase = createSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in auth.users table first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true
    });

    if (authError) {
      logger.error('Error creating auth user', { email, error: authError });
      return { success: false, error: 'Failed to create user account' };
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        credits: 20, // Default credits for new users
        plan_type: 'free',
        ...profile,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Error creating user profile', { email, error: profileError });
      
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      return { success: false, error: 'Failed to create user profile' };
    }

    logger.info('User registered successfully', { 
      userId: authUser.user.id, 
      email: email.toLowerCase() 
    });

    // Generate token
    const token = generateToken({
      id: authUser.user.id,
      email: email.toLowerCase()
    });

    return {
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        credits: userProfile.credits,
        plan_type: userProfile.plan_type
      },
      token
    };

  } catch (error) {
    logger.error('Error in registerUser', { email, error: error.message });
    return { success: false, error: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result
 */
const loginUser = async (email, password) => {
  try {
    const supabase = createSupabaseClient();

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, password_hash, credits, plan_type, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      logger.warn('Login attempt with non-existent email', { email });
      return { success: false, error: 'Invalid email or password' };
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { email, userId: user.id });
      return { success: false, error: 'Invalid email or password' };
    }

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        plan_type: user.plan_type,
        created_at: user.created_at
      },
      token
    };

  } catch (error) {
    logger.error('Error in loginUser', { email, error: error.message });
    return { success: false, error: 'Login failed' };
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data or null if not found
 */
const getUserById = async (userId) => {
  try {
    const supabase = createSupabaseClient();

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('id, email, credits, plan_type, total_credits_spent, total_videos_created, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      logger.warn('User not found', { userId });
      return null;
    }

    return user;

  } catch (error) {
    logger.error('Error in getUserById', { userId, error: error.message });
    return null;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Update result
 */
const updateUserProfile = async (userId, updates) => {
  try {
    const supabase = createSupabaseClient();

    // Remove sensitive fields that shouldn't be updated directly
    const { id, email, password_hash, credits, ...safeUpdates } = updates;

    const { data: user, error } = await supabase
      .from('user_profiles')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, credits, plan_type, total_credits_spent, total_videos_created, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error updating user profile', { userId, error });
      return { success: false, error: 'Failed to update profile' };
    }

    logger.info('User profile updated successfully', { userId });
    return { success: true, user };

  } catch (error) {
    logger.error('Error in updateUserProfile', { userId, error: error.message });
    return { success: false, error: 'Profile update failed' };
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Change result
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const supabase = createSupabaseClient();

    // Get current password hash
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newHashedPassword = await hashPassword(newPassword);

    // Update password in database
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        password_hash: newHashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error updating password', { userId, error: updateError });
      return { success: false, error: 'Failed to update password' };
    }

    // Also update in Supabase Auth if needed
    await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    logger.info('Password changed successfully', { userId });
    return { success: true };

  } catch (error) {
    logger.error('Error in changePassword', { userId, error: error.message });
    return { success: false, error: 'Password change failed' };
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  changePassword
};