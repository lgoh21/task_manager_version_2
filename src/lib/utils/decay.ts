// decay.ts — Calculate decay stage and opacity from updated_at
// Only applies to Someday tasks

import { DECAY } from '@/config/constants';
import type { DecayStage } from '@/types';

/** Calculate the number of full days since last update */
export function daysSinceUpdate(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** Get the decay stage for a Someday task */
export function getDecayStage(updatedAt: string): DecayStage {
  const days = daysSinceUpdate(updatedAt);

  if (days <= DECAY.FADE_START_DAYS) return 'fresh';
  if (days <= DECAY.LABEL_START_DAYS) return 'slight_fade';
  if (days <= DECAY.PROMPT_DAYS) return 'noticeable';
  if (days <= DECAY.FULL_DECAY_DAYS) return 'prompt';
  return 'fully_decayed';
}

/** Get the opacity value for a decay stage */
export function getDecayOpacity(updatedAt: string): number {
  const stage = getDecayStage(updatedAt);

  switch (stage) {
    case 'fresh':
      return DECAY.OPACITY.FULL;
    case 'slight_fade':
      return DECAY.OPACITY.SLIGHT_FADE;
    case 'noticeable':
      return DECAY.OPACITY.NOTICEABLE_FADE;
    case 'prompt':
      return DECAY.OPACITY.NEAR_TRANSPARENT;
    case 'fully_decayed':
      return DECAY.OPACITY.FULLY_DECAYED;
  }
}

/** Get the decay label to show, if any */
export function getDecayLabel(updatedAt: string): string | null {
  const days = daysSinceUpdate(updatedAt);
  const stage = getDecayStage(updatedAt);

  switch (stage) {
    case 'noticeable':
      return `${days}d old`;
    case 'prompt':
    case 'fully_decayed':
      return 'Still want this?';
    default:
      return null;
  }
}
