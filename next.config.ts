import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM addons; letting Next optimize the barrel
  // imports keeps the 3D chunk from pulling in all of drei.
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
};

export default nextConfig;
