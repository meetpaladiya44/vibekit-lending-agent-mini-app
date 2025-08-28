import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type and lint checks during builds (useful for Vercel deploys)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
