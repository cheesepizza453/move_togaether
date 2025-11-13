import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/common/ClientLayout';
import { AuthProvider } from '@/hooks/useAuth';
import { DialogProvider } from '@/components/DialogProvider';
import { SplashProvider } from "@/components/SplashProvider";

const inter = Inter({ subsets: ['latin'] });

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