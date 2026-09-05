import type { EntityShape } from '@/features/editor/types';
import { HOUSEHOLD_HEIGHT, HOUSEHOLD_WIDTH, SHAPE_SIZE } from '@/features/editor/shapes';

export const MIN_LINE_SCALE = 0.5;
export const MAX_LINE_SCALE = 3;

export function clampScale(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function entityDimensions(shape: EntityShape): { width: number; height: number } {
  if (shape === 'household') {
    return { width: HOUSEHOLD_WIDTH, height: HOUSEHOLD_HEIGHT };
  }
  return { width: SHAPE_SIZE, height: SHAPE_SIZE };
}
