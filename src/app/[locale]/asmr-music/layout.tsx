import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ASMR Music Player | Ambient Sounds for Focus, Relax & Sleep',
  description: 'Free online ASMR music player with ambient sounds for focus, relaxation, and sleep. Mix rain, ocean, fireplace, and nature sounds. No download required - play instantly in your browser.',
  keywords: [
    'free ASMR music player',
    'ambient sounds online',
    'focus music player',
    'relaxing sounds',
    'sleep sounds',
    'nature sounds mixer',
    'rain sounds',
    'ocean waves',
    'fireplace sounds',
    'concentration music',
    'meditation sounds',
    'white noise player',
    'background sounds',
    'ASMR soundscape',
    'free ambient music',
    'online sound mixer'
  ].join(', '),
  authors: [{ name: 'AIASMR Team' }],
  creator: 'AIASMR',
  publisher: 'AIASMR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.aiasmr.vip'),
  alternates: {
    canonical: '/asmr-music',
  },
  openGraph: {
    title: 'Free ASMR Music Player | Ambient Sounds for Focus, Relax & Sleep',
    description: 'Free online ASMR music player with ambient sounds for focus, relaxation, and sleep. Mix rain, ocean, fireplace, and nature sounds. No download required - play instantly in your browser.',
    url: '/asmr-music',
    siteName: 'AIASMR',
    images: [
      {
        url: '/images/asmr-music-banner.jpeg',
        width: 1200,
        height: 630,
        alt: 'Free ASMR Music Player Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ASMR Music Player | Ambient Sounds for Focus, Relax & Sleep',
    description: 'Free online ASMR music player with ambient sounds for focus, relaxation, and sleep. Mix rain, ocean, fireplace, and nature sounds.',
    images: ['/images/asmr-music-banner.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ASMRMusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}