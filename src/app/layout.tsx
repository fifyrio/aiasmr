import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// Root layout for non-internationalized pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}