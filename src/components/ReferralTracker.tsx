'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReferralTracker } from '@/utils/referral-tracker';

/**
 * 全局推荐码追踪组件
 * 应该在 RootLayout 中使用，确保每个页面都能捕获推荐码
 */
export default function ReferralTrackerComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 从 URL 参数提取推荐码
    const ref = searchParams.get('ref');
    if (ref) {
      ReferralTracker.setReferralCode(ref);
    }

    // 从完整 URL 提取推荐码（备选）
    ReferralTracker.extractFromURL();
  }, [searchParams]);

  // 调试信息（仅开发环境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const code = ReferralTracker.getReferralCode();
      if (code) {
        console.log('[ReferralTracker] Current referral code:', code);
        console.log('[ReferralTracker] Storage status:', ReferralTracker.getStatus());
      }
    }
  }, []);

  return null; // 这是一个隐形组件
}