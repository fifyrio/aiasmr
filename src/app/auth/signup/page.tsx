import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return <AuthForm mode="signup" />
}

export const metadata = {
  title: 'Sign Up - AIASMR Video',
  description: 'Create your AIASMR Video account to start generating AI-powered ASMR videos with our advanced technology.',
  alternates: {
    canonical: 'https://aiasmr.so/auth/signup',
  },
}