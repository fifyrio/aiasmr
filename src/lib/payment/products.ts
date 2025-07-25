// Product configurations based on AIASMR pricing structure

import { Product } from './types';

// Credit packages (one-time purchases)
export const CREDIT_PACKAGES: Product[] = [
  {
    product_id: 'credits_50',
    product_name: '50 Credits Pack',
    price: 999, // $9.99 in cents
    credits: 50,
    type: 'once',
    description: 'Perfect for trying out our AI ASMR video generation',
    features: [
      '50 video generation credits',
      'Standard quality videos',
      'Basic triggers selection',
      'Download in HD'
    ]
  },
  {
    product_id: 'credits_100',
    product_name: '100 Credits Pack',
    price: 1899, // $18.99 in cents
    credits: 100,
    type: 'once',
    description: 'Great value for regular users',
    features: [
      '100 video generation credits',
      'Standard quality videos',
      'All triggers available',
      'Download in HD',
      '10% bonus credits'
    ]
  },
  {
    product_id: 'credits_250',
    product_name: '250 Credits Pack',
    price: 4499, // $44.99 in cents
    credits: 250,
    type: 'once',
    description: 'Best value for power users',
    features: [
      '250 video generation credits',
      'High quality videos',
      'All triggers available',
      'Download in 4K',
      '25% bonus credits',
      'Priority generation queue'
    ]
  }
];

// Subscription plans
export const SUBSCRIPTION_PLANS: Product[] = [
  {
    product_id: 'basic_monthly',
    product_name: 'Basic Plan',
    price: 1390, // $13.90 in cents
    credits: 50, // Monthly credits
    type: 'subscription',
    billing_period: 'monthly',
    description: 'Everything you need to get started with AI ASMR videos',
    features: [
      '50 credits per month',
      'Standard quality videos',
      'All ASMR triggers',
      'Download in HD',
      'Email support',
      'No watermark'
    ]
  },
  {
    product_id: 'pro_monthly',
    product_name: 'Pro Plan',
    price: 1990, // $19.90 in cents
    credits: 100, // Monthly credits
    type: 'subscription',
    billing_period: 'monthly',
    description: 'Perfect for content creators and enthusiasts',
    features: [
      '100 credits per month',
      'High quality videos',
      'All ASMR triggers',
      'Download in 4K',
      'Priority support',
      'No watermark',
      'Commercial usage rights',
      'Advanced customization',
      'Priority generation queue'
    ]
  },
  {
    product_id: 'basic_yearly',
    product_name: 'Basic Plan (Yearly)',
    price: 13900, // $139.00 in cents (2 months free)
    credits: 50, // Monthly credits
    type: 'subscription',
    billing_period: 'yearly',
    description: 'Save 17% with yearly billing',
    features: [
      '50 credits per month',
      'Standard quality videos',
      'All ASMR triggers',
      'Download in HD',
      'Email support',
      'No watermark',
      '2 months FREE!'
    ]
  },
  {
    product_id: 'pro_yearly',
    product_name: 'Pro Plan (Yearly)',
    price: 19900, // $199.00 in cents (2 months free)
    credits: 100, // Monthly credits
    type: 'subscription',
    billing_period: 'yearly',
    description: 'Best value for serious creators',
    features: [
      '100 credits per month',
      'High quality videos',
      'All ASMR triggers',
      'Download in 4K',
      'Priority support',
      'No watermark',
      'Commercial usage rights',
      'Advanced customization',
      'Priority generation queue',
      '2 months FREE!'
    ]
  }
];

// All products combined
export const ALL_PRODUCTS: Product[] = [
  ...CREDIT_PACKAGES,
  ...SUBSCRIPTION_PLANS
];

// Helper functions
export const getProductById = (productId: string): Product | undefined => {
  return ALL_PRODUCTS.find(product => product.product_id === productId);
};

export const getCreditPackages = (): Product[] => {
  return CREDIT_PACKAGES;
};

export const getSubscriptionPlans = (): Product[] => {
  return SUBSCRIPTION_PLANS;
};

export const getMonthlyPlans = (): Product[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.billing_period === 'monthly');
};

export const getYearlyPlans = (): Product[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.billing_period === 'yearly');
};

// Format price for display
export const formatPrice = (priceInCents: number): string => {
  return `$${(priceInCents / 100).toFixed(2)}`;
};

// Calculate yearly savings
export const calculateYearlySavings = (monthlyPlan: Product, yearlyPlan: Product): number => {
  const monthlyYearlyPrice = monthlyPlan.price * 12;
  return monthlyYearlyPrice - yearlyPlan.price;
};