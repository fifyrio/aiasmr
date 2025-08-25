import './globals.css'

// Root layout - minimal configuration
// The actual layout logic is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}