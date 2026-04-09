import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
