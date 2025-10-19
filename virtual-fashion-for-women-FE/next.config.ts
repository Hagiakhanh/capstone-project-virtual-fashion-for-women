import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ✅ Bỏ qua ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Bỏ qua lỗi TypeScript khi build
  },
   experimental: {
    optimizeCss: false, // tắt LightningCSS chính Next.js gọi
  },
  webpack: (config) => {
    // ⚠️ Chặn hoàn toàn LightningCSS nếu package nào cố import nó
    config.externals.push({
      lightningcss: 'commonjs lightningcss',
    });
    return config;
  },
};

export default nextConfig;
