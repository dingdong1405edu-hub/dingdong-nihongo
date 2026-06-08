import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/ja",
  assetPrefix: "/ja",
  experimental: {
    // Allow Server Actions when this zone is reached through dingdongspeak.com
    serverActions: {
      allowedOrigins: ["dingdongspeak.com", "web-production-53710.up.railway.app"],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [
    "kuroshiro",
    "kuroshiro-analyzer-kuromoji",
    "@mapbox/node-pre-gyp",
    "kuromoji",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;
