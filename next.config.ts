import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 's3.eu-central-2.wasabisys.com',
      },
      {
        protocol: 'https',
        hostname: 'simplejo.s3.eu-central-2.wasabisys.com',
      },
    ],
  },
};

export default nextConfig;
