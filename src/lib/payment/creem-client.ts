// Real Creem.io payment client
import { CreateCheckoutRequest, CreateCheckoutResponse } from './types';
import { getPaymentConfig } from './config';

export class CreemPaymentClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    const config = getPaymentConfig();
    this.apiKey = apiKey || config.apiKey;
    
    // Determine API base URL based on environment
    if (config.paymentUrl.includes('test') || this.apiKey.includes('test')) {
      this.baseUrl = 'https://test-api.creem.io/v1';
    } else {
      this.baseUrl = 'https://api.creem.io/v1';
    }
    
    console.log('CreemPaymentClient initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey.substring(0, 10) + '...',
      baseUrl: this.baseUrl
    });
    
    if (!this.apiKey) {
      throw new Error('Creem API key is required');
    }
  }

  async createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    // Based on the API error, try with minimal required fields first
    const requestBody: any = {
      product_id: request.product_id,
    };
    
    // Only add optional fields if they exist and are supported
    if (request.success_url) {
      requestBody.success_url = request.success_url;
    }
    
    if (request.metadata && Object.keys(request.metadata).length > 0) {
      requestBody.metadata = request.metadata;
    }
    
    console.log('Creem API request details:', {
      url: `${this.baseUrl}/checkouts`,
      method: 'POST',
      body: requestBody
    });

    try {
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,  // Use x-api-key instead of Authorization Bearer
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Creem API response status:', response.status);
      console.log('Creem API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        console.log('Creem API error response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unknown error' };
        }
        
        throw new Error(`Creem API error: ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        checkout_id: data.id,
        payment_url: data.url,
        status: data.status || 'pending',
      };
    } catch (error) {
      console.error('Creem checkout creation failed:', error);
      throw error;
    }
  }

  // 验证回调签名
  verifySignature(params: Record<string, string>, signature: string): boolean {
    try {
      // 实现Creem.io的签名验证逻辑
      // 这里需要根据Creem.io的文档实现具体的签名验证
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      // 使用你的webhook secret进行HMAC验证
      const crypto = require('crypto');
      const config = getPaymentConfig();
      const webhookSecret = config.webhookSecret;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(sortedParams)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // 验证webhook签名（用于POST请求）
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const config = getPaymentConfig();
      const webhookSecret = config.webhookSecret;
      
      // 移除signature的前缀（如果有的话）
      const cleanSignature = signature.replace(/^sha256=/, '');
      
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');
      
      return cleanSignature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  // 获取 checkout 状态（用于验证支付）
  async getCheckoutStatus(checkoutId: string): Promise<any> {
    try {
      console.log('Getting checkout status for:', checkoutId);
      console.log('Using API base URL:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}/checkouts?checkout_id=${checkoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Creem API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Checkout status response:', data);
      
      return data;
    } catch (error) {
      console.error('Failed to get checkout status:', error);
      throw error;
    }
  }
}

export const createCreemPaymentClient = () => {
  return new CreemPaymentClient();
};