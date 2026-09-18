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
    qualities: [65, 75],
  },
  async redirects() {
    return [
      // Locale migration: redirect bare paths to /en/ equivalents (permanent 301).
      // These preserve SEO equity for any external links that indexed the old bare URLs.
      { source: "/", destination: "/en/", permanent: true },
      { source: "/tours/:slug*", destination: "/en/tours/:slug*", permanent: true },
      { source: "/book/:slug*", destination: "/en/book/:slug*", permanent: true },
      {
        source: "/contact-seville-tours-co/:path*",
        destination: "/en/contact-seville-tours-co/:path*",
        permanent: true,
      },
      {
        source: "/discover-spain-with-a-historian/:path*",
        destination: "/en/discover-spain-with-a-historian/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
