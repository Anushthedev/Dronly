import type { NextConfig } from 'next';

/**
 * GitHub Pages cannot run a Node server and serves a project site from a
 * subpath, so the Pages workflow builds with DRONLY_STATIC_EXPORT=1 and
 * NEXT_PUBLIC_BASE_PATH=/Dronly. Everything here is gated behind that flag:
 * `next dev` and a plain `next build` still serve the site from the root
 * with a server, exactly as before.
 */
const isExport = process.env.DRONLY_STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  ...(isExport && {
    output: 'export' as const,
    // Pages has no rewrite layer in front of it, so every route has to exist
    // as its own directory index rather than relying on extensionless lookup.
    trailingSlash: true,
    ...(basePath && { basePath, assetPrefix: basePath }),
  }),
};

export default nextConfig;
