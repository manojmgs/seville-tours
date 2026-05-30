import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sevilletoursco.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  async redirects() {
    return [
      // Phase 0 rule: keep URLs 1:1. Add redirects only after SEO review.
      // Example:
      // {
      //   source: '/old-url/',
      //   destination: '/new-url/',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;
