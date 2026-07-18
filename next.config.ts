import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracing: false,
  },
};

export default nextConfig;