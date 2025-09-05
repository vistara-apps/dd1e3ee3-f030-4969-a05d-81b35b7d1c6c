import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LexiGuard - Your Rights, Instantly',
  description: 'Stay Informed, Stay Safe. Instant legal rights information and communication tools for police interactions.',
  keywords: 'legal rights, police interactions, civil rights, legal protection, mobile app',
  authors: [{ name: 'LexiGuard Team' }],
  openGraph: {
    title: 'LexiGuard - Your Rights, Instantly',
    description: 'Stay Informed, Stay Safe. Instant legal rights information and communication tools for police interactions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexiGuard - Your Rights, Instantly',
    description: 'Stay Informed, Stay Safe. Instant legal rights information and communication tools for police interactions.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
