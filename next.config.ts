import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  reactStrictMode: true,
  // استخدم webpack بدل Turbopack للبناء على السيرفر
  experimental: {
    turbo: undefined,
  },
  output: "standalone",
};

export default nextConfig;