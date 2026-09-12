'use client';

import { motion } from 'framer-motion';

/**
 * Lightweight stand-in shown while the 3D chunk streams in. Deliberately
 * pure CSS: it must be able to paint before any of the 3D code exists.
 */
export function SceneLoader() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08080a]"
    >
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(80%_60%_at_50%_100%,rgba(100,58,237,0.22),transparent_70%)]" />

      <div className="text-meadow-cream/70 absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <motion.span
          className="bg-drone-violet size-1.5 rounded-full"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="type-label">Spinning up rotors</span>
      </div>
    </div>
  );
}
