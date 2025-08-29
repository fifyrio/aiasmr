import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FreeCreditsClient from './FreeCreditsClient';

// Server-side metadata generation
export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const t = await getTranslations({ locale, namespace: 'freeCredits' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default async function FreeCreditsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'freeCredits' });
  
  // Static translations for server-side rendering
  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    checkIn: {
      title: t('checkIn.title'),
      description: t('checkIn.description'),
    },
    referral: {
      title: t('referral.title'),
      description: t('referral.description'),
    },
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="pt-16"> {/* Offset for fixed navigation */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
              {translations.title}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {translations.subtitle}
            </p>
          </div>

          {/* Client-side components with loading states */}
          <Suspense 
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            }
          >
            <FreeCreditsClient translations={translations} />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}