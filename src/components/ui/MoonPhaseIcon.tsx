'use client';

import { getLunarPhase } from '@/lib/utils/lunarPhase';

interface MoonPhaseIconProps {
  size?: number;
  isDark?: boolean;
  className?: string;
}

/**
 * Light mode: sun icon. Dark mode: current real lunar phase with glow.
 */
export function MoonPhaseIcon({ size = 18, isDark = false, className = '' }: MoonPhaseIconProps) {
  if (!isDark) {
    return <SunIcon size={size} className={className} />;
  }

  return <MoonIcon size={size} className={className} />;
}

function SunIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon({ size, className }: { size: number; className: string }) {
  const { phase, illumination } = getLunarPhase();

  const r = 8;
  const cx = 12;
  const cy = 12;

  const glowColor = '#FCD34D';
  const fillOpacity = Math.max(illumination, 0.3);
  const litPath = buildLitPath(cx, cy, r, phase);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ filter: `drop-shadow(0 0 ${3 + illumination * 4}px ${glowColor}40)` }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={glowColor}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d={litPath}
        fill={glowColor}
        opacity={fillOpacity}
      />
    </svg>
  );
}

/**
 * Build the SVG path for the illuminated portion of the moon.
 *
 * Uses two arcs from top to bottom:
 * 1. The outer edge — always a semicircular arc along the lit side
 * 2. The terminator — an elliptical arc whose rx varies with phase
 *
 * Phase 0 = new moon (nothing lit), 0.25 = first quarter (right half),
 * 0.5 = full moon (all lit), 0.75 = last quarter (left half).
 */
function buildLitPath(cx: number, cy: number, r: number, phase: number): string {
  const top = cy - r;
  const bottom = cy + r;

  // How much the terminator bulges: +r = fully right, 0 = flat, -r = fully left
  // At phase 0 (new): cos(0) = 1 → terminator at +r (flush with right edge, no lit area)
  // At phase 0.25 (first quarter): cos(π/2) = 0 → flat terminator (right half lit)
  // At phase 0.5 (full): cos(π) = -1 → terminator at -r (full circle lit)
  const tX = Math.cos(phase * 2 * Math.PI) * r;

  // Clamp rx to avoid degenerate arcs when terminator is nearly flat
  const rx = Math.max(Math.abs(tX), 0.1);

  if (phase <= 0 || phase >= 1) {
    // New moon — nothing to draw
    return '';
  }

  if (phase < 0.5) {
    // Waxing: right side is lit
    // Outer arc: top → bottom clockwise (right semicircle)
    const outerArc = `A ${r} ${r} 0 0 1 ${cx} ${bottom}`;
    // Terminator arc: bottom → top
    // When tX > 0 (crescent, terminator bulges right): sweep=0 (CCW, bulge left = thin crescent)
    // When tX < 0 (gibbous, terminator bulges left): sweep=1 (CW, bulge right = fat area)
    const terminatorSweep = tX > 0 ? 0 : 1;
    const terminatorArc = `A ${rx} ${r} 0 0 ${terminatorSweep} ${cx} ${top}`;
    return `M ${cx} ${top} ${outerArc} ${terminatorArc} Z`;
  } else {
    // Waning: left side is lit
    // Outer arc: top → bottom counter-clockwise (left semicircle)
    const outerArc = `A ${r} ${r} 0 0 0 ${cx} ${bottom}`;
    // Terminator arc: bottom → top
    // When tX < 0 (gibbous, terminator bulges left): sweep=0 (CCW, bulge right = fat area)
    // When tX > 0 (crescent, terminator bulges right): sweep=1 (CW, bulge left = thin crescent)
    const terminatorSweep = tX < 0 ? 0 : 1;
    const terminatorArc = `A ${rx} ${r} 0 0 ${terminatorSweep} ${cx} ${top}`;
    return `M ${cx} ${top} ${outerArc} ${terminatorArc} Z`;
  }
}
