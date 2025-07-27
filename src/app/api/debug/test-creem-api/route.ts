import { NextResponse } from 'next/server';
import { getPaymentConfig } from '@/lib/payment/config';

export async function GET() {
  try {
    const config = getPaymentConfig();
    const baseUrl = config.paymentUrl.includes('test') ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';
    
    console.log('Testing Creem API with:', {
      baseUrl,
      hasApiKey: !!config.apiKey,
      apiKeyPrefix: config.apiKey.substring(0, 10) + '...'
    });

    // Test API connection by trying to get products or a simple endpoint
    const response = await fetch(`${baseUrl}/products`, {
      method: 'GET',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Creem API test response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      baseUrl,
      apiKeyPrefix: config.apiKey.substring(0, 10) + '...',
      response: responseData,
      headers: Object.fromEntries(response.headers.entries()),
    });

  } catch (error) {
    console.error('Creem API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}