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

  const terminatorX = Math.cos(phase * 2 * Math.PI) * r;
  const isWaxing = phase < 0.5;
  const litPath = buildLitPath(cx, cy, r, terminatorX, isWaxing);

  const glowColor = '#FCD34D';
  const fillOpacity = Math.max(illumination, 0.3);

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
