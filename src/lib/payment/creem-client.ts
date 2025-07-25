// Real Creem.io payment client
import { CreateCheckoutRequest, CreateCheckoutResponse } from './types';

export class CreemPaymentClient {
  private apiKey: string;
  private baseUrl = 'https://api.creem.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CREEM_API_KEY || '';
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
      const webhookSecret = process.env.CREEM_WEBHOOK_SECRET || '';
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
}

export const createCreemPaymentClient = () => {
  return new CreemPaymentClient();
};