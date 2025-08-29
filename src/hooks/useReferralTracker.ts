'use client';

import { useState, useEffect } from 'react';
import { ReferralTracker } from '@/utils/referral-tracker';

/**
 * React Hook for using referral tracking
 */
export function useReferralTracker() {
  const [referralCode, setReferralCodeState] = useState<string | null>(null);

  useEffect(() => {
    // 页面加载时尝试获取推荐码
    const existingCode = ReferralTracker.getReferralCode();
    if (existingCode) {
      setReferralCodeState(existingCode);
    }

    // 从当前 URL 提取推荐码
    const urlCode = ReferralTracker.extractFromURL();
    if (urlCode && urlCode !== existingCode) {
      setReferralCodeState(urlCode);
    }
  }, []);

  const setReferralCode = (code: string) => {
    ReferralTracker.setReferralCode(code);
    setReferralCodeState(code);
  };

  const clearReferralCode = () => {
    ReferralTracker.clearReferralCode();
    setReferralCodeState(null);
  };

  return {
    referralCode,
    setReferralCode,
    clearReferralCode,
    hasReferralCode: !!referralCode
  };
}