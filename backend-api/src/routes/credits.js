const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { validateCreditsPurchase, validatePagination } = require('../middleware/validation');
const { creditsPurchaseLimit } = require('../middleware/rate-limit');
const { asyncHandler } = require('../middleware/error-handler');
const { 
  getUserCredits, 
  getCreditHistory, 
  addCredits 
} = require('../services/credits-manager');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/credits/balance
 * @desc    Get user's current credit balance
 * @access  Private
 */
router.get('/balance',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user credit balance', { userId });

    try {
      const result = await getUserCredits(userId);

      if (result.error) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'BALANCE_FETCH_FAILED',
            message: result.error
          }
        });
      }

      logger.info('Successfully fetched credit balance', { 
        userId, 
        credits: result.credits 
      });

      res.json({
        success: true,
        data: {
          balance: result.credits,
          user: {
            id: req.user.id,
            email: req.user.email,
            plan_type: req.user.plan_type
          }
        }
      });

    } catch (error) {
      logger.error('Error in credit balance endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'BALANCE_ERROR',
          message: 'Failed to fetch credit balance'
        }
      });
    }
  })
);

/**
 * @route   GET /api/credits/history
 * @desc    Get user's credit transaction history
 * @access  Private
 */
router.get('/history',
  authMiddleware,
  validatePagination,
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    logger.debug('Fetching user credit history', { userId, page, limit, offset });

    try {
      const result = await getCreditHistory(userId, limit, offset);

      if (result.error) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'HISTORY_FETCH_FAILED',
            message: result.error
          }
        });
      }

      const transactions = result.transactions || [];
      const total = transactions.length;
      const totalPages = Math.ceil(total / limit);

      logger.info('Successfully fetched credit history', { 
        userId, 
        transactionCount: transactions.length,
        page,
        totalPages
      });

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error in credit history endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: 'Failed to fetch credit history'
        }
      });
    }
  })
);

/**
 * @route   POST /api/credits/purchase
 * @desc    Purchase credits (placeholder implementation)
 * @access  Private
 */
router.post('/purchase',
  authMiddleware,
  creditsPurchaseLimit,
  validateCreditsPurchase,
  asyncHandler(async (req, res) => {
    const { package: packageType, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    logger.info('Credit purchase request', { 
      userId, 
      packageType, 
      paymentMethod, 
      amount 
    });

    try {
      // Define credit packages
      const packages = {
        basic: { credits: 100, price: 9.99 },
        standard: { credits: 250, price: 19.99 },
        premium: { credits: 500, price: 34.99 },
        enterprise: { credits: 1000, price: 59.99 }
      };

      const selectedPackage = packages[packageType];

      if (!selectedPackage) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Invalid credit package selected'
          }
        });
      }

      // Validate amount matches package
      if (amount !== selectedPackage.credits) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: 'Credit amount does not match selected package'
          }
        });
      }

      // TODO: Implement actual payment processing
      // This is a placeholder implementation
      // In production, you would:
      // 1. Create payment intent with Stripe/PayPal
      // 2. Process payment
      // 3. Add credits only after successful payment
      
      // For now, we'll simulate a successful payment
      const mockPaymentSuccess = true;
      
      if (mockPaymentSuccess) {
        // Add credits to user account
        const result = await addCredits(
          userId, 
          selectedPackage.credits, 
          'purchase', 
          `Credit purchase - ${packageType} package`
        );

        if (result.success) {
          logger.info('Credits purchased successfully', { 
            userId, 
            packageType, 
            creditsAdded: selectedPackage.credits,
            newBalance: result.newCredits,
            price: selectedPackage.price
          });

          res.json({
            success: true,
            data: {
              transaction: {
                package: packageType,
                creditsAdded: selectedPackage.credits,
                price: selectedPackage.price,
                paymentMethod,
                newBalance: result.newCredits
              }
            },
            message: `Successfully purchased ${selectedPackage.credits} credits`
          });
        } else {
          logger.error('Failed to add credits after payment', { 
            userId, 
            packageType, 
            error: result.error 
          });

          res.status(500).json({
            success: false,
            error: {
              code: 'CREDIT_ADD_FAILED',
              message: 'Payment processed but failed to add credits. Please contact support.'
            }
          });
        }
      } else {
        // Payment failed
        res.status(400).json({
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: 'Payment processing failed. Please try again.'
          }
        });
      }

    } catch (error) {
      logger.error('Error in credit purchase endpoint', { 
        userId, 
        packageType, 
        error: error.message 
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PURCHASE_ERROR',
          message: 'Failed to process credit purchase'
        }
      });
    }
  })
);

/**
 * @route   GET /api/credits/packages
 * @desc    Get available credit packages
 * @access  Public
 */
router.get('/packages',
  asyncHandler(async (req, res) => {
    logger.debug('Fetching credit packages');

    const packages = [
      {
        id: 'basic',
        name: 'Basic',
        credits: 100,
        price: 9.99,
        description: 'Perfect for trying out video generation',
        popular: false
      },
      {
        id: 'standard',
        name: 'Standard',
        credits: 250,
        price: 19.99,
        description: 'Great for regular users',
        popular: true,
        savings: '20%'
      },
      {
        id: 'premium',
        name: 'Premium',
        credits: 500,
        price: 34.99,
        description: 'Best value for frequent creators',
        popular: false,
        savings: '30%'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 1000,
        price: 59.99,
        description: 'Maximum credits for power users',
        popular: false,
        savings: '40%'
      }
    ];

    res.json({
      success: true,
      data: {
        packages
      }
    });
  })
);

/**
 * @route   GET /api/credits/usage
 * @desc    Get user's credit usage statistics
 * @access  Private
 */
router.get('/usage',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user credit usage statistics', { userId });

    try {
      const result = await getCreditHistory(userId, 1000); // Get recent transactions
      
      if (result.error) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'USAGE_FETCH_FAILED',
            message: result.error
          }
        });
      }

      const transactions = result.transactions || [];
      
      // Calculate usage statistics
      const totalSpent = transactions
        .filter(t => t.transaction_type === 'usage')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const totalPurchased = transactions
        .filter(t => t.transaction_type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalRefunded = transactions
        .filter(t => t.transaction_type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0);

      const videoGenerationCount = transactions
        .filter(t => t.transaction_type === 'usage')
        .length;

      // Get current balance
      const balanceResult = await getUserCredits(userId);
      const currentBalance = balanceResult.credits || 0;

      logger.info('Successfully fetched credit usage statistics', { 
        userId, 
        totalSpent,
        totalPurchased,
        currentBalance,
        videoGenerationCount
      });

      res.json({
        success: true,
        data: {
          usage: {
            totalSpent,
            totalPurchased,
            totalRefunded,
            currentBalance,
            videoGenerationCount,
            averagePerVideo: videoGenerationCount > 0 ? Math.round(totalSpent / videoGenerationCount) : 0
          }
        }
      });

    } catch (error) {
      logger.error('Error in credit usage endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'USAGE_ERROR',
          message: 'Failed to fetch credit usage statistics'
        }
      });
    }
  })
);

module.exports = router;