'use client';

import { getLunarPhase } from '@/lib/utils/lunarPhase';

interface MoonPhaseIconProps {
  size?: number;
  isDark?: boolean;
  className?: string;
}

/**
 * Renders the current real lunar phase as an SVG.
 * When isDark (dark mode is active), the moon glows with a warm colour.
 */
export function MoonPhaseIcon({ size = 18, isDark = false, className = '' }: MoonPhaseIconProps) {
  const { phase, illumination } = getLunarPhase();

  // The moon disc
  const r = 8;
  const cx = 12;
  const cy = 12;

  // Build the illuminated portion using an arc + ellipse edge
  // phase 0 = new moon (all shadow), 0.5 = full moon (all lit)
  // The terminator is an ellipse whose x-radius varies with phase
  const terminatorX = Math.cos(phase * 2 * Math.PI) * r;

  // Determine which side is lit
  const isWaxing = phase < 0.5;

  // Build SVG path for the lit portion
  // We draw from top to bottom using two arcs:
  // 1. The outer edge (always a semicircle on the lit side)
  // 2. The terminator (an elliptical curve)
  const litPath = buildLitPath(cx, cy, r, terminatorX, isWaxing);

  const glowColor = isDark ? '#FCD34D' : 'currentColor';
  const fillOpacity = isDark ? Math.max(illumination, 0.3) : Math.max(illumination * 0.6, 0.15);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ filter: isDark ? `drop-shadow(0 0 ${3 + illumination * 4}px ${glowColor}40)` : undefined }}
    >
      {/* Moon outline */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={isDark ? glowColor : 'currentColor'}
        strokeWidth="1.5"
        fill="none"
        opacity={isDark ? 1 : 0.7}
      />
      {/* Illuminated portion */}
      <path
        d={litPath}
        fill={glowColor}
        opacity={fillOpacity}
      />
    </svg>
  );
}

function buildLitPath(cx: number, cy: number, r: number, terminatorX: number, isWaxing: boolean): string {
  const top = cy - r;
  const bottom = cy + r;

  if (isWaxing) {
    // Right side is lit
    // Arc from top to bottom along right side (large arc, sweep clockwise)
    // Then back via terminator (elliptical)
    return [
      `M ${cx} ${top}`,
      `A ${r} ${r} 0 0 1 ${cx} ${bottom}`,
      `A ${Math.abs(terminatorX)} ${r} 0 0 ${terminatorX > 0 ? 0 : 1} ${cx} ${top}`,
      'Z',
    ].join(' ');
  } else {
    // Left side is lit
    return [
      `M ${cx} ${top}`,
      `A ${r} ${r} 0 0 0 ${cx} ${bottom}`,
      `A ${Math.abs(terminatorX)} ${r} 0 0 ${terminatorX < 0 ? 1 : 0} ${cx} ${top}`,
      'Z',
    ].join(' ');
  }
}
