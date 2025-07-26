// Real Creem.io payment client
import { CreateCheckoutRequest, CreateCheckoutResponse } from './types';
import { getPaymentConfig } from './config';

export class CreemPaymentClient {
  private apiKey: string;
  private baseUrl = 'https://api.creem.io/v1';

  constructor(apiKey?: string) {
    const config = getPaymentConfig();
    this.apiKey = apiKey || config.apiKey;
    if (!this.apiKey) {
      throw new Error('Creem API key is required');
    }
  }

  async createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: request.product_id,
          customer_email: request.customer_email,
          success_url: request.success_url,
          cancel_url: request.cancel_url,
          metadata: request.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Creem API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
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
      const config = getPaymentConfig();
      const baseUrl = config.paymentUrl.includes('test') ? 'https://test-api.creem.io' : 'https://api.creem.io';
      
      const response = await fetch(`${baseUrl}/v1/checkouts?checkout_id=${checkoutId}`, {
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