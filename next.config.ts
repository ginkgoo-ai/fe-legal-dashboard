import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  ...(isDevelopment && { hostname: 'local.slatecast.dev' }), // ...(isDevelopment && { hostname: 'local.legal.dev' }),
  experimental: {
    routerBFCache: false,
  },
  env: {
    APP_ENV: process.env.APP_ENV,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-test.slatecast.dev/api/:path*', // destination: 'https://api-legal.ginkgoo.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
