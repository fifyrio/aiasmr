'use client'

import { useState, useEffect } from 'react';
import { getPaymentConfig, getPaymentEnvironment } from '@/lib/payment/config';
import { PLANS } from '@/lib/payment/products';

export default function DebugPaymentPage() {
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  
  useEffect(() => {
    // 获取配置信息
    fetch('/api/debug/payment-config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Failed to fetch config:', err));
    
    // 获取产品信息
    setProducts(PLANS);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Payment Configuration Debug</h1>
      
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {config ? JSON.stringify(config, null, 2) : 'Loading...'}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {products ? JSON.stringify(products, null, 2) : 'Loading...'}
          </pre>
        </div>
      </div>
    </div>
  );
}