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
    optimizeCss: false, // 🚫 Tắt LightningCSS, dùng PostCSS thường
  },
};

export default nextConfig;
