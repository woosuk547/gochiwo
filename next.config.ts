import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
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
        source: '/',
        has: [{ type: 'host', value: 'www.repause.co.kr' }],
        destination: 'https://repause.co.kr',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.repause.co.kr' }],
        destination: 'https://repause.co.kr/:path*',
        permanent: true,
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
