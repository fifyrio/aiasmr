'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message') || 'An unknown error occurred during payment processing.';
    setErrorMessage(message);

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
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/pricing');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@aiasmr.vip?subject=Payment Error&body=' + encodeURIComponent(`I encountered a payment error: ${errorMessage}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Error Icon */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Error</h1>
          <p className="text-red-100">Something went wrong</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">We&apos;re sorry!</h2>
            <p className="text-gray-600 text-sm mb-4">
              There was an issue processing your payment. Don&apos;t worry, no charges were made to your account.
            </p>
            
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">Error Details:</p>
              <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            </div>
          </div>

          {/* What to do next */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">What you can do:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try the payment again</li>
              <li>• Check your internet connection</li>
              <li>• Use a different payment method</li>
              <li>• Contact our support team</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Try Payment Again
            </button>

            <button
              onClick={handleContactSupport}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Contact Support
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

          {/* Support Info */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              If this problem persists, please contact our support team:
            </p>
            <a 
              href="mailto:support@aiasmr.vip" 
              className="text-xs text-blue-500 hover:underline"
            >
              support@aiasmr.vip
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}