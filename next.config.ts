import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Instagram serves media from rotating CDN hosts.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
};

export default nextConfig;
