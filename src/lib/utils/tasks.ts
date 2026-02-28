// tasks.ts — Size weight calculation, heavy day check, sort order helpers

import { HEAVY_DAY } from '@/config/constants';
import type { Task, TaskSize } from '@/types';

/** Get the weight value for a task size */
export function getSizeWeight(size: TaskSize): number {
  return HEAVY_DAY.WEIGHTS[size];
}

/** Calculate total weight of a list of tasks */
export function calculateTotalWeight(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + getSizeWeight(task.size), 0);
}

/** Check if a day is "heavy" based on total task weight */
export function isHeavyDay(tasks: Task[]): boolean {
  return calculateTotalWeight(tasks) >= HEAVY_DAY.THRESHOLD;
}

/** Get the next sort order value for a list */
export function getNextSortOrder(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.max(...tasks.map((t) => t.sort_order)) + 1;
}

/** Generate sort orders for reordering (after drag & drop) */
export function reorderSortValues(
  items: { id: string; sort_order: number }[],
  fromIndex: number,
  toIndex: number
): { id: string; sort_order: number }[] {
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);

  return result.map((item, index) => ({
    id: item.id,
    sort_order: index,
  }));
}

/** Format task size for display */
export function formatSize(size: TaskSize): string {
  switch (size) {
    case 'S':
      return 'Small';
    case 'M':
      return 'Medium';
    case 'L':
      return 'Large';
  }
}
