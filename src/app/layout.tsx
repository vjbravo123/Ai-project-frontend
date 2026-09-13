import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { AuthModal } from '@/components/auth/AuthModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'NEO AI | NestJS + Gemini Command Center',
  description: 'Full-stack AI interface for Gemini LangChain chat, Vision, and Autonomous Newsletter Agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-[#070b14] text-slate-100 min-h-screen antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 pl-64 flex flex-col min-h-screen">
              <TopHeader />
              <div className="flex-1">{children}</div>
            </div>
          </div>
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}