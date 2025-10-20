import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode 활성화 (개발 시 추가 검증)
  reactStrictMode: true,

  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 실험적 기능 활성화
  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // 메모리 사용량 최적화
    memoryBasedWorkersCount: true,
    // 서버 액션 최적화
    serverActions: {
      allowedOrigins: ['localhost:3008', 'move-togaether.com', 'move-togaether.vercel.app']
    },
    // 실시간 기능 최적화
    serverMinification: true,
  },

  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    // 카카오 SDK 외부화
    config.externals = [...config.externals, 'kakao'];

    // 프로덕션에서 번들 크기 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // 이미지 최적화 설정 (Vercel 비용 절약을 위해 비활성화)
  images: {
    // Vercel 이미지 최적화 비활성화 (비용 절약)
    unoptimized: true,
    // Supabase 스토리지 도메인 설정
    domains: [
      'localhost',
      'vnexvfnsgjfrixexlgdp.supabase.co', // Supabase 스토리지 도메인
      'move-togaether.com'
    ],
    // 외부 이미지 도메인 허용
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // 압축 설정
  compress: true,

  // 정적 파일 최적화
  trailingSlash: false,

  // 헤더 설정 (캐싱 최적화)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
