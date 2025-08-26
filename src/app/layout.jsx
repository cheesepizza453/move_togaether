import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Move Together - 함께 움직이는 새로운 경험",
  description: "Next.js, Tailwind CSS, shadcn/ui로 구축된 모바일 우선 웹 애플리케이션",
  keywords: ["Next.js", "Tailwind CSS", "shadcn/ui", "모바일", "웹앱"],
  authors: [{ name: "Move Together Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#3b82f6",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Move Together" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950`}
      >
        {children}
      </body>
    </html>
  );
}
