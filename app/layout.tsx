import './globals.css';
import type { Metadata } from 'next';
import { Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RexKit - Transform Your Business Idea',
  description: 'Transform your business idea into a comprehensive launch package in seconds with RexKit',
  openGraph: {
    title: 'RexKit - Transform Your Business Idea',
    description: 'Transform your business idea into a comprehensive launch package in seconds',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RexKit - Transform Your Business Idea',
    description: 'Transform your business idea into a comprehensive launch package in seconds',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans3.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
