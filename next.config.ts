import type { NextConfig } from "next";

/**
 * Where the staging Studio lives. Used by the production-only redirect
 * below so anyone landing on /admin on the live site is bounced over to
 * the staging admin where edits are safe.
 */
const STAGING_ADMIN_BASE = 'https://staging--vero-assess-staging.netlify.app';

const isProductionDataset = process.env.NEXT_PUBLIC_SANITY_DATASET === 'production';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  /**
   * On production builds (veroassess.com), force every /admin/* request
   * over to the staging admin. This means clients can never accidentally
   * edit production content directly — the only path to live is via the
   * "Push to Live Site" action from the staging Studio.
   *
   * On staging builds this returns no redirects, so /admin works normally.
   */
  async redirects() {
    if (!isProductionDataset) return [];
    return [
      {
        source: '/admin',
        destination: `${STAGING_ADMIN_BASE}/admin`,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${STAGING_ADMIN_BASE}/admin/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
