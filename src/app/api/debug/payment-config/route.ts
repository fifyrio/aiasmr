import { NextResponse } from 'next/server';
import { getPaymentConfig, getPaymentEnvironment } from '@/lib/payment/config';

export async function GET() {
  try {
    const config = getPaymentConfig();
    const env = getPaymentEnvironment();
    
    return NextResponse.json({
      environment: env,
      config: config,
      rawEnvVars: {
        PAYMENT_ENV: process.env.PAYMENT_ENV,
        CREEM_TEST_API_KEY: process.env.CREEM_TEST_API_KEY ? '***' : 'NOT_SET',
        CREEM_TEST_TRIAL_PRODUCT_ID: process.env.CREEM_TEST_TRIAL_PRODUCT_ID,
        CREEM_TEST_BASIC_PRODUCT_ID: process.env.CREEM_TEST_BASIC_PRODUCT_ID,
        CREEM_TEST_PRO_PRODUCT_ID: process.env.CREEM_TEST_PRO_PRODUCT_ID,
        CREEM_TEST_PAYMENT_URL: process.env.CREEM_TEST_PAYMENT_URL,
        CREEM_PROD_API_KEY: process.env.CREEM_PROD_API_KEY ? '***' : 'NOT_SET',
        CREEM_PROD_TRIAL_PRODUCT_ID: process.env.CREEM_PROD_TRIAL_PRODUCT_ID,
        CREEM_PROD_BASIC_PRODUCT_ID: process.env.CREEM_PROD_BASIC_PRODUCT_ID,
        CREEM_PROD_PRO_PRODUCT_ID: process.env.CREEM_PROD_PRO_PRODUCT_ID,
        CREEM_PROD_PAYMENT_URL: process.env.CREEM_PROD_PAYMENT_URL,
        CREEM_API_KEY: process.env.CREEM_API_KEY ? '***' : 'NOT_SET',
        CREEM_TRIAL_PRODUCT_ID: process.env.CREEM_TRIAL_PRODUCT_ID,
        CREEM_BASIC_PRODUCT_ID: process.env.CREEM_BASIC_PRODUCT_ID,
        CREEM_PRO_PRODUCT_ID: process.env.CREEM_PRO_PRODUCT_ID,
        CREEM_PAYMENT_URL: process.env.CREEM_PAYMENT_URL,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get payment config',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}