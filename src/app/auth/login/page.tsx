import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return <AuthForm mode="login" />
}

export const metadata = {
  title: 'Sign In - AIASMR Video',
  description: 'Sign in to your AIASMR Video account to access premium features and generate AI-powered ASMR videos.',
  alternates: {
    canonical: 'https://www.aiasmr.vip/auth/login',
  },
}