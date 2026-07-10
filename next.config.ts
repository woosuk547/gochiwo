import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
  },
  async redirects() {
    return [
      {
        source: '/stays',
        destination: '/space',
        permanent: false,
      },
      {
        source: '/stays/:slug*',
        destination: '/space',
        permanent: false,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'repause.com' }],
        destination: 'https://repause.co.kr/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.repause.com' }],
        destination: 'https://repause.co.kr/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
