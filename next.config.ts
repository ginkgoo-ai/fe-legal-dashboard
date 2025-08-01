import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  ...(isDevelopment && { hostname: 'local.up.railway.app' }), // ...(isDevelopment && { hostname: 'local.legal.dev' }),
  experimental: {
    routerBFCache: false,
  },
  reactStrictMode: true,
  env: {
    LOCAL_BASE_URL: process.env.LOCAL_BASE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-test.up.railway.app/api/:path*', // destination: 'https://api-legal.ginkgoo.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
