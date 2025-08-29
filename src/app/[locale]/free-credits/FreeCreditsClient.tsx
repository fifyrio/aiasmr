'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import CheckInSection from './components/CheckInSection';
import ReferralSection from './components/ReferralSection';
import { toast } from 'react-hot-toast';

interface FreeCreditsClientProps {
  translations: {
    title: string;
    subtitle: string;
    checkIn: {
      title: string;
      description: string;
    };
    referral: {
      title: string;
      description: string;
    };
  };
}

export default function FreeCreditsClient({ translations }: FreeCreditsClientProps) {
  const t = useTranslations('freeCredits');
  const params = useParams();
  const locale = params.locale as string;
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, refreshCredits } = useCredits();
  const [checkInData, setCheckInData] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (user && !authLoading && !dataFetched) {
      fetchFreeCreditsData();
    }
  }, [user, authLoading, dataFetched]);

  const fetchFreeCreditsData = async () => {
    try {
      setLoading(true);
      
      // Fetch check-in data and referral data in parallel
      const [checkInResponse, referralResponse] = await Promise.all([
        fetch('/api/free-credits/check-in'),
        fetch('/api/free-credits/referral')
      ]);

      if (checkInResponse.ok) {
        const checkInResult = await checkInResponse.json();
        setCheckInData(checkInResult.data);
      }

      if (referralResponse.ok) {
        const referralResult = await referralResponse.json();
        setReferralData(referralResult.data);
      }
    } catch (error) {
      console.error('Error fetching free credits data:', error);
      toast.error(t('errors.fetchDataFailed'));
    } finally {
      setLoading(false);
      setDataFetched(true);
    }
  };

  const handleCheckInSuccess = (newCredits: number) => {
    refreshCredits(); // Refresh credits balance
    setDataFetched(false); // Allow re-fetching
    fetchFreeCreditsData(); // Refresh check-in data
    toast.success(t('checkIn.successMessage', { credits: newCredits }));
  };

  const handleReferralUpdate = () => {
    setDataFetched(false); // Allow re-fetching
    fetchFreeCreditsData(); // Refresh referral data
  };

  // Show login prompt for unauthenticated users first (no loading needed)
  if (!authLoading && !user) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-700">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('auth.loginRequired')}
          </h2>
          <p className="text-gray-300 mb-6">
            {t('auth.loginDescription')}
          </p>
          <div className="space-y-3">
            <Link
              href={`/${locale}/auth/login`}
              className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {t('auth.loginButton')}
            </Link>
            <Link
              href={`/${locale}/auth/signup`}
              className="block w-full border border-purple-600 text-purple-400 py-3 px-6 rounded-lg font-semibold hover:bg-purple-600/10 transition-colors"
            >
              {t('auth.signupButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state only for authenticated users
  if (authLoading || (user && (creditsLoading || loading))) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // This shouldn't happen, but just in case
  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-700">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('auth.loginRequired')}
          </h2>
          <p className="text-gray-300 mb-6">
            {t('auth.loginDescription')}
          </p>
          <div className="space-y-3">
            <Link
              href={`/${locale}/auth/login`}
              className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {t('auth.loginButton')}
            </Link>
            <Link
              href={`/${locale}/auth/signup`}
              className="block w-full border border-purple-600 text-purple-400 py-3 px-6 rounded-lg font-semibold hover:bg-purple-600/10 transition-colors"
            >
              {t('auth.signupButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Credits Balance Display */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-700">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-3xl">💰</span>
          <span className="text-2xl font-bold text-white">
            {credits?.credits || 0} {t('credits.title')}
          </span>
        </div>
        <p className="text-gray-400">
          {t('credits.description')}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Check In Section */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {translations.checkIn.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {translations.checkIn.description}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <CheckInSection 
              data={checkInData}
              onCheckInSuccess={handleCheckInSuccess}
              loading={loading}
            />
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {translations.referral.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {translations.referral.description}
                </p>
              </div>
              <div className="ml-auto bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                {t('referral.reward')}
              </div>
            </div>
          </div>
          <div className="p-6">
            <ReferralSection 
              data={referralData}
              onUpdate={handleReferralUpdate}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}