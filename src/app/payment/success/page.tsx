'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 如果仍在加载中，等待
    if (loading) {
      return;
    }

    // 如果用户未登录，等待一段时间再检查（给认证时间完成）
    if (!user) {
      const authCheckTimeout = setTimeout(() => {
        if (!user) {
          router.push('/auth/login');
        }
      }, 2000); // 等待2秒让认证完成

      return () => clearTimeout(authCheckTimeout);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/create');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, loading, router]);

  const handleContinue = () => {
    router.push('/create');
  };

  // 如果仍在加载认证状态，显示加载页面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Processing...</h1>
            <p className="text-green-100">Verifying your payment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success Icon */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your purchase has been completed</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Thank you for your purchase!</h2>
            <p className="text-gray-600 text-sm">
              Your credits have been added to your account and you can now start creating amazing ASMR videos.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">What&apos;s next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your credits are now available in your account</li>
              <li>• Visit the Create page to start generating videos</li>
              <li>• Check your email for a receipt</li>
              <li>• Explore all available ASMR triggers</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Start Creating Videos
            </button>

            <div className="text-center text-sm text-gray-500">
              Redirecting automatically in {countdown} seconds...
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@aiasmr.vip" className="text-blue-500 hover:underline">
                support@aiasmr.vip
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}