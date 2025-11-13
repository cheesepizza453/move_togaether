import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/common/ClientLayout';
import { AuthProvider } from '@/hooks/useAuth';
import { DialogProvider } from '@/components/DialogProvider';
import {SplashProvider} from "@/components/SplashProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: '무브투개더 - 함께 움직여 마음을 잇다',
    template: '%s | 무브투개더'
  },
  description: '유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다.',
  keywords: ['유기견', '이동봉사', '매칭', '보호소', '입양', '봉사자', 'Move Togaether', '반려동물', '구조', '봉사활동'],
  authors: [{ name: 'Move Togaether Team' }],
  creator: 'Move Togaether',
  publisher: 'Move Togaether',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://move-togaether.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://move-togaether.com',
    title: '무브투개더 - 함께 움직여 마음을 잇다',
    description: '유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다.',
    siteName: '무브투개더',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '무브투개더 - 함께 움직여 마음을 잇다',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무브투개더 - 함께 움직여 마음을 잇다',
    description: '유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다.',
    images: ['/img/og-image.jpg'],
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
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFD700',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`mx-auto max-w-[550px] w-full ${inter.className} antialiased dark:bg-gray-950 bg-[rgba(0,0,0,0.8)]`}>
        <AuthProvider>
          <DialogProvider>
            <SplashProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </SplashProvider>
          </DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
