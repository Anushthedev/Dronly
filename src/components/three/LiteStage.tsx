'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

import { DroneGlyph } from '@/components/three/DroneGlyph';

/**
 * The mobile / low-power stand-in for the R3F scene.
 *
 * Same narrative — the drone rises, banks, surveys, then lands — expressed
 * in three composited transforms instead of a WebGL context. It costs a few
 * hundred bytes and runs entirely on the compositor.
 */
export function LiteStage() {
  const { scrollYProgress } = useScroll();

  // One spring feeding every transform keeps the whole glyph moving as a
  // single body rather than as independently lagging properties.
  const p = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const x = useTransform(
    p,
    [0, 0.25, 0.5, 0.72, 1],
    ['0%', '26%', '-28%', '18%', '0%'],
  );
  const y = useTransform(
    p,
    [0, 0.25, 0.5, 0.72, 1],
    ['0%', '-34%', '12%', '-22%', '18%'],
  );
  const rotate = useTransform(p, [0, 0.25, 0.5, 0.72, 1], [0, -14, 18, -10, 0]);
  const scale = useTransform(p, [0, 0.5, 1], [1, 0.76, 1.04]);
  // Kept deliberately faint: on a phone the glyph sits directly behind body
  // copy, and legibility beats presence.
  const opacity = useTransform(p, [0, 0.08, 0.9, 1], [0.32, 0.45, 0.45, 0.35]);
  const horizon = useTransform(p, [0, 1], ['0%', '-12%']);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08080a]"
    >
      {/* Sky gradient + violet horizon glow */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{ y: horizon }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(100,58,237,0.30),transparent_70%)]" />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(247,244,232,0.14) 1px, transparent 1px), linear-gradient(to top, rgba(247,244,232,0.14) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
          }}
        />
      </motion.div>

      <motion.div
        className="text-meadow-cream absolute top-[66%] left-1/2 w-[46vw] max-w-[260px] -translate-x-1/2 -translate-y-1/2"
        style={{ x, y, rotate, scale, opacity }}
      >
        <DroneGlyph className="w-full" />
      </motion.div>
    </div>
  );
}

/**
 * Reduced-motion / no-WebGL fallback: the same composition, holding still.
 */
export function StillStage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08080a]"
    >
      <div className="absolute inset-x-0 bottom-0 h-[70%]">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(100,58,237,0.26),transparent_70%)]" />
      </div>
      <div className="text-meadow-cream absolute top-[64%] left-1/2 w-[44vw] max-w-[260px] -translate-x-1/2 -translate-y-1/2 opacity-40">
        <DroneGlyph className="w-full" />
      </div>
    </div>
  );
}
