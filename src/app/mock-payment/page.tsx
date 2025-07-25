'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const checkoutId = searchParams.get('checkout_id');
    const productId = searchParams.get('product_id');
    const email = searchParams.get('email');
    const successUrl = searchParams.get('success_url');
    const cancelUrl = searchParams.get('cancel_url');

    if (!checkoutId || !productId) {
      router.push('/payment/error?message=Invalid payment parameters');
      return;
    }

    setPaymentData({
      checkoutId,
      productId,
      email,
      successUrl,
      cancelUrl
    });
  }, [searchParams, router]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to callback with success status
    const callbackUrl = `/api/payment/callback?checkout_id=${paymentData.checkoutId}&status=success`;
    window.location.href = callbackUrl;
  };

  const handlePaymentCancel = () => {
    // Redirect to callback with cancel status
    const callbackUrl = `/api/payment/callback?checkout_id=${paymentData.checkoutId}&status=cancel`;
    window.location.href = callbackUrl;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <h1 className="text-white text-xl font-bold">Mock Payment Gateway</h1>
          <p className="text-blue-100 text-sm">This is a demo payment page</p>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{paymentData.productId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{paymentData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Checkout ID:</span>
                <span className="font-mono text-sm">{paymentData.checkoutId}</span>
              </div>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-medium">Demo Mode</span>
            </div>
            <p className="text-yellow-700 text-sm">
              This is a mock payment gateway for testing purposes. No real payment will be processed.
            </p>
          </div>

          {/* Payment Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePaymentSuccess}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                '✅ Simulate Successful Payment'
              )}
            </button>

            <button
              onClick={handlePaymentCancel}
              disabled={loading}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ❌ Cancel Payment
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              In a real implementation, this would be your payment provider&apos;s checkout page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}