import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/common/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Move Togaether - 유기견 이동봉사 매칭 플랫폼',
  description: '입양 예정인 유기견들이 새로운 가족에게 안전하게 이동할 수 있도록 봉사자와 보호소/개인 구조자를 연결하는 매칭 플랫폼',
  keywords: ['유기견', '이동봉사', '매칭', '보호소', '입양', '봉사자', 'Move Togaether'],
  authors: [{ name: 'Move Togaether Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
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
    <html lang="ko" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Move Togaether" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`mx-auto max-w-[550px] w-full ${inter.className} antialiased dark:bg-gray-950 bg-[rgba(0,0,0,0.8)]`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
