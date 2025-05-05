import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,

  eslint: {
    ignoreDuringBuilds: true, // ✅ disable linting errors from blocking Vercel build
  },

  typescript: {
    ignoreBuildErrors: true,  // (Optional) disable TypeScript errors in production builds
  },
};

export default nextConfig;
