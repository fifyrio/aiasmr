import React from 'react'
import { getTranslations } from 'next-intl/server'
import LoginForm from '@/components/LoginForm'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'auth.login' })
  
  return {
    title: t('title') + ' - AIASMR Video',
    description: t('title'),
    alternates: {
      canonical: `https://www.aiasmr.vip/${locale}/auth/login`,
      languages: {
        'en': 'https://www.aiasmr.vip/en/auth/login',
        'zh': 'https://www.aiasmr.vip/zh/auth/login',
      }
    }
  }
}

export default function LoginPage() {
  return <LoginForm />
}