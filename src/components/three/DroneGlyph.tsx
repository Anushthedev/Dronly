import { cn } from '@/lib/utils';

/**
 * Flat vector version of the aircraft, shared by the lightweight and static
 * fallbacks. Same silhouette as the 3D model — four arms, gimbal forward,
 * beacon aft — so the brand reads identically without a WebGL context.
 */
export function DroneGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={cn('overflow-visible', className)}
      fill="none"
      aria-hidden="true"
    >
      {/* rotor discs */}
      {[
        [30, 34],
        [130, 34],
        [30, 86],
        [130, 86],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="26"
            ry="6"
            fill="currentColor"
            opacity="0.16"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx="26"
            ry="6"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx={cx} cy={cy} r="5" fill="currentColor" opacity="0.9" />
        </g>
      ))}

      {/* arms */}
      <path
        d="M30 34 L64 52 M130 34 L96 52 M30 86 L64 68 M130 86 L96 68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* body */}
      <rect
        x="60"
        y="46"
        width="40"
        height="28"
        rx="9"
        fill="currentColor"
        opacity="0.92"
      />
      {/* gimbal */}
      <circle cx="80" cy="80" r="8" fill="currentColor" opacity="0.92" />
      <circle cx="80" cy="80" r="3.4" fill="#643aed" />
      {/* beacon */}
      <circle cx="80" cy="44" r="2.6" fill="#643aed" />
    </svg>
  );
}
