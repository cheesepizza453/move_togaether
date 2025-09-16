import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
    webpack: (config) => {
        config.externals = [...config.externals, 'kakao'];
        return config;
    },
    images: {
        unoptimized: true, // 이미지 최적화 활성화
    },
};

export default nextConfig;
