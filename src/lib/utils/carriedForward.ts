// carriedForward.ts — Days-on-today logic, badge display rules

import { CARRIED_FORWARD } from '@/config/constants';
import type { Task } from '@/types';

/** Check if a task should show the "carried over" badge */
export function isCarriedForward(task: Task): boolean {
  return task.status === 'today' && task.days_on_today > 0;
}

/** Get the carried forward badge text */
export function getCarriedForwardLabel(task: Task): string | null {
  if (!isCarriedForward(task)) return null;

  if (task.days_on_today >= CARRIED_FORWARD.SHOW_COUNT_AFTER_DAYS) {
    return `Day ${task.days_on_today}`;
  }

  return 'Carried over';
}
