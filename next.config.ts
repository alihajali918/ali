import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* تفعيل ميزة الصور إذا كنت ستستخدم صوراً خارجية مستقبلاً */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // يسمح بجلب الصور من أي مصدر خارجي حالياً
      },
    ],
  },
  /* خيارات إضافية لتحسين الأداء */
  reactStrictMode: true, 
};

export default nextConfig;