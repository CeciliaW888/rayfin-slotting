import type { SkuRow, SlotRow } from './types';

const AISLES = 4;
const BAYS = 6;
const LEVELS = 3;
const SKU_COUNT = 50;
const CATEGORIES = ['Ambient', 'Chilled', 'Bulky', 'Hazmat', 'Promo'];

export interface DcSeed {
  skus: Omit<SkuRow, 'id'>[];
  slots: Omit<SlotRow, 'id' | 'sku_id'>[];
  /** Per-slot SKU code (or null for an empty slot), aligned to `slots` by index. */
  assignments: (string | null)[];
}

/**
 * Build a deterministic demo DC with a deliberately BAD starting layout: the
 * fastest-moving SKUs are placed in the farthest slots. That gives the diagnose
 * view something to flag and leaves a large, visible win for the optimizer.
 */
export function generateDc(): DcSeed {
  const slots: DcSeed['slots'] = [];
  for (let aisle = 1; aisle <= AISLES; aisle++) {
    for (let bay = 1; bay <= BAYS; bay++) {
      for (let level = 1; level <= LEVELS; level++) {
        // bay drives depth (distance from dock); aisle drives lateral position.
        slots.push({ aisle, bay, level, x: bay * 2, y: aisle * 3 });
      }
    }
  }

  // Pareto-ish pick rates: a few very fast movers, a long slow tail.
  const skus: DcSeed['skus'] = [];
  for (let i = 0; i < SKU_COUNT; i++) {
    skus.push({
      code: `SKU-${String(i + 1).padStart(3, '0')}`,
      name: `Product ${i + 1}`,
      category: CATEGORIES[i % CATEGORIES.length],
      picksPerDay: Math.max(1, Math.round(220 / (i + 1))),
    });
  }

  // Worst-case assignment: SKUs are already in pick-desc order; assign each to
  // the next-farthest slot so fast movers land where they hurt most.
  const slotsByDistDesc = slots
    .map((_, idx) => idx)
    .sort((i, j) => slots[j].x + slots[j].y - (slots[i].x + slots[i].y));
  const assignments: (string | null)[] = new Array(slots.length).fill(null);
  for (let i = 0; i < skus.length && i < slotsByDistDesc.length; i++) {
    assignments[slotsByDistDesc[i]] = skus[i].code;
  }

  return { skus, slots, assignments };
}
