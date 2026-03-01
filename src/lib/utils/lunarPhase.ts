// lunarPhase.ts — Calculate the current lunar phase from any date
// The lunar cycle is ~29.53 days. We use a known new moon (Jan 6 2000)
// as a reference point and calculate the phase from there.

const LUNAR_CYCLE_DAYS = 29.53058770576;
const REFERENCE_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

export type LunarPhaseName =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

interface LunarPhase {
  /** 0–1 where 0 = new moon, 0.5 = full moon */
  phase: number;
  /** Human-readable phase name */
  name: LunarPhaseName;
  /** 0–1 how much of the moon is illuminated */
  illumination: number;
}

/** Get the lunar phase for a given date (defaults to now) */
export function getLunarPhase(date: Date = new Date()): LunarPhase {
  const daysSinceReference = (date.getTime() - REFERENCE_NEW_MOON) / (1000 * 60 * 60 * 24);
  const cyclePosition = ((daysSinceReference % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
  const phase = cyclePosition / LUNAR_CYCLE_DAYS; // 0–1

  // Illumination: 0 at new moon, 1 at full moon
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

  const name = getPhaseName(phase);
  return { phase, name, illumination };
}

function getPhaseName(phase: number): LunarPhaseName {
  if (phase < 0.0625) return 'new_moon';
  if (phase < 0.1875) return 'waxing_crescent';
  if (phase < 0.3125) return 'first_quarter';
  if (phase < 0.4375) return 'waxing_gibbous';
  if (phase < 0.5625) return 'full_moon';
  if (phase < 0.6875) return 'waning_gibbous';
  if (phase < 0.8125) return 'last_quarter';
  if (phase < 0.9375) return 'waning_crescent';
  return 'new_moon';
}
