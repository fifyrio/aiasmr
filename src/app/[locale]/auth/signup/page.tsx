import React from 'react'
import { getTranslations } from 'next-intl/server'
import SignupForm from '@/components/SignupForm'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'auth.signup' })
  
  return {
    title: t('title') + ' - AIASMR Video',
    description: t('title'),
    alternates: {
      canonical: `https://www.aiasmr.vip/${locale}/auth/signup`,
      languages: {
        'en': 'https://www.aiasmr.vip/en/auth/signup',
        'zh': 'https://www.aiasmr.vip/zh/auth/signup',
      }
    }
  }
}

export default function SignupPage() {
  return <SignupForm />
}