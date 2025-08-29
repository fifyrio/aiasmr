'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalCreditsEarned: number;
  stats: {
    completed: number;
    pending: number;
    earned: number;
  };
  recentReferrals: Array<{
    email: string;
    status: 'pending' | 'registered' | 'converted' | 'credited';
    creditsEarned: number;
    createdAt: string;
  }>;
}

interface ReferralSectionProps {
  data: ReferralData | null;
  onUpdate: () => void;
  loading: boolean;
}

export default function ReferralSection({ data, onUpdate, loading }: ReferralSectionProps) {
  const t = useTranslations('freeCredits.referral');
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('default');
  const [shareText, setShareText] = useState('');

  // Initialize shareText when data is available
  React.useEffect(() => {
    if (data && !shareText) {
      setShareText(getPlatformShareText('default'));
    }
  }, [data, shareText]);

  // Platform-specific share texts
  const getPlatformShareText = (platform: string) => {
    const baseMessage = `${t('shareMessage')} ${data?.referralLink}`;
    const platformMessages = {
      default: `${t('shareMessage')} ${data?.referralLink}`,
      twitter: `🎬 AI ASMR Video - Transform, stylize & enhance photos with one AI click. No design skills needed! Join with my invite link for bonus credits! ${data?.referralLink}`,
      facebook: `📱 ${t('platform.facebook')} ${data?.referralLink}`,
      linkedin: `💼 ${t('platform.linkedin')} ${data?.referralLink}`,
      whatsapp: `🎥 ${t('platform.whatsapp')} ${data?.referralLink}`,
    };
    return platformMessages[platform as keyof typeof platformMessages] || baseMessage;
  };

  const copyToClipboard = async (content?: string) => {
    if (!data?.referralLink) return;

    const textToCopy = content || getCurrentShareText();
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(t('copyFailed'));
    }
  };

  const selectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    const newText = getPlatformShareText(platform);
    setShareText(newText);
  };

  const getCurrentShareText = () => {
    return shareText || getPlatformShareText(selectedPlatform);
  };

  const shareToSocial = (platform: string) => {
    if (!data?.referralLink) return;

    const text = getPlatformShareText(platform);
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(data.referralLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(getPlatformShareText(platform))}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400">
        {t('noData')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          {t('referralLink')}
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={data.referralLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 text-sm"
          />
          <button
            onClick={() => copyToClipboard(getCurrentShareText())}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
              ${copied 
                ? 'bg-green-600 text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            {copied ? (
              <span className="flex items-center">
                <span className="mr-1">✓</span>
                {t('copied')}
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-1">📋</span>
                {t('copy')}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 bg-gray-700 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {data.stats.completed}
          </div>
          <div className="text-sm text-gray-400">
            {t('completed')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {data.stats.pending}
          </div>
          <div className="text-sm text-gray-400">
            {t('pending')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {data.stats.earned}
          </div>
          <div className="text-sm text-gray-400">
            {t('earned')}
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          {t('shareTo')}
        </label>
        
        {/* Custom message input */}
        <textarea
          value={shareText}
          onChange={(e) => setShareText(e.target.value)}
          placeholder={t('shareMessage')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm resize-none bg-gray-700 text-gray-100 placeholder-gray-400"
        />
        
        {/* Platform selection buttons */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => selectPlatform('default')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              selectedPlatform === 'default' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title="Default Link"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C3.71 7 1 9.71 1 12.9s2.71 5.1 5.9 5.1h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.1-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c3.19 0 5.9-2.71 5.9-5.9S20.29 7 17.1 7z"/>
            </svg>
            <span className="text-xs mt-1">Link</span>
          </button>
          
          <button
            onClick={() => selectPlatform('twitter')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              selectedPlatform === 'twitter' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-blue-400'
            }`}
            title="Twitter"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <span className="text-xs mt-1">Twitter</span>
          </button>
          
          <button
            onClick={() => selectPlatform('facebook')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              selectedPlatform === 'facebook' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-blue-600'
            }`}
            title="Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs mt-1">Facebook</span>
          </button>
          
          <button
            onClick={() => selectPlatform('linkedin')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              selectedPlatform === 'linkedin' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-blue-700'
            }`}
            title="LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-xs mt-1">LinkedIn</span>
          </button>
          
          <button
            onClick={() => selectPlatform('whatsapp')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              selectedPlatform === 'whatsapp' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-green-600'
            }`}
            title="WhatsApp"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span className="text-xs mt-1">WhatsApp</span>
          </button>
        </div>

        {/* Copy Button */}
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(getCurrentShareText())}
            className={`
              flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
              ${copied 
                ? 'bg-green-600 text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>{t('copied')}</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>{t('copy')}</span>
              </>
            )}
          </button>
          
          {selectedPlatform !== 'default' && (
            <button
              onClick={() => shareToSocial(selectedPlatform)}
              className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>{t('share')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Recent Referrals */}
      {data.recentReferrals && data.recentReferrals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">
            {t('recentReferrals')}
          </h3>
          <div className="space-y-2">
            {data.recentReferrals.slice(0, 3).map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {referral.email.replace(/(.{3}).*@/, '$1***@')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${referral.status === 'credited' 
                        ? 'bg-green-100 text-green-800' 
                        : referral.status === 'converted'
                        ? 'bg-blue-100 text-blue-800'
                        : referral.status === 'registered'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    {t(`status.${referral.status}`)}
                  </span>
                  {referral.creditsEarned > 0 && (
                    <span className="text-xs font-bold text-green-600">
                      +{referral.creditsEarned}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Terms */}
      <div className="bg-purple-600/10 rounded-lg p-4 text-sm text-purple-400 border border-purple-600/20">
        <div className="font-medium mb-2">{t('howItWorks')}</div>
        <ul className="space-y-1 text-xs">
          <li>• {t('step1')}</li>
          <li>• {t('step2')}</li>
          <li>• {t('step3')}</li>
        </ul>
      </div>
    </div>
  );
}