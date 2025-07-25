'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/pricing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRetry = () => {
    router.push('/pricing');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cancel Icon */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-100">Your payment was not completed</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No worries!</h2>
            <p className="text-gray-600 text-sm">
              Your payment was cancelled and no charges were made to your account. 
              You can try again anytime.
            </p>
          </div>

          {/* What happened */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">What happened?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Payment was cancelled by user</li>
              <li>• No charges were made</li>
              <li>• Your account remains unchanged</li>
              <li>• You can retry payment anytime</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go to Homepage
            </button>

            <div className="text-center text-sm text-gray-500">
              Redirecting to pricing in {countdown} seconds...
            </div>
          </div>

          {/* Alternative Options */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Still interested?</h3>
            <p className="text-xs text-gray-600 mb-3">
              You can explore our free features or contact support if you encountered any issues.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/explore')}
                className="flex-1 text-xs bg-green-100 text-green-700 py-2 px-3 rounded hover:bg-green-200 transition-colors"
              >
                Explore Free Content
              </button>
              <button
                onClick={() => window.open('mailto:support@aiasmr.vip')}
                className="flex-1 text-xs bg-blue-100 text-blue-700 py-2 px-3 rounded hover:bg-blue-200 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}