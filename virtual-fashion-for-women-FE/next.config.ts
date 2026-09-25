import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ✅ Bỏ qua ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Bỏ qua lỗi TypeScript khi build
  },
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Bạn có thể thêm port hoặc pathname nếu cần
      },
    ],
  },
};

export default nextConfig;
