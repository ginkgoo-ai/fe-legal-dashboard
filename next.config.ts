import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  ...(isDevelopment && { hostname: 'local.legal.dev' }),
  experimental: {
    routerBFCache: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-legal.ginkgoo.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
