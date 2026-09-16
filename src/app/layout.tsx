import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'JoshAi — Your AI Productivity Workspace',
    template: '%s | JoshAi',
  },

  description:
    'JoshAi is an AI-powered productivity workspace for intelligent conversations, image analysis, personalized newsletters, and spaced-repetition learning.',

  applicationName: 'JoshAi',

  keywords: [
    'JoshAi',
    'AI productivity',
    'AI assistant',
    'AI workspace',
    'AI chat',
    'AI image analysis',
    'AI newsletter',
    'AI study assistant',
    'spaced repetition',
    'AI learning assistant',
  ],

  authors: [{ name: 'Vivek Joshi' }],
  creator: 'Vivek Joshi',
  publisher: 'JoshAi',

  category: 'productivity',

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'JoshAi',
    title: 'JoshAi — Your AI Productivity Workspace',
    description:
      'Chat, analyze images, create intelligent newsletters, and learn smarter with JoshAi.',
    images: [
      {
        url: '/logo.png',
        alt: 'JoshAi Logo',
      },
    ],
  },

  twitter: {
    card: 'summary',
    title: 'JoshAi — Your AI Productivity Workspace',
    description:
      'An AI-powered workspace for conversations, image analysis, newsletters, and smarter learning.',
    images: ['/logo.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JoshAi',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered productivity workspace for conversations, image analysis, newsletters, and spaced-repetition learning.',
  image: `${siteUrl}/logo.png`,
  url: siteUrl,
  creator: {
    '@type': 'Person',
    name: 'Vivek Joshi',
  },
  featureList: [
    'AI conversations',
    'Conversational memory',
    'Image analysis',
    'AI newsletter generation',
    'Spaced repetition learning',
    'Study tracking',
    'Audio study log transcription',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body
        className={`
          ${inter.variable}
          ${mono.variable}
          font-sans
          min-h-screen
          bg-[#F8FAFC]
          text-[#0F172A]
          antialiased
          selection:bg-blue-100
          selection:text-blue-900
        `}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}