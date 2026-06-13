import type { SkuRow, SlotRow } from './types';

const AISLES = 4;
const BAYS = 6;
const LEVELS = 3;
const SKU_COUNT = 50;
const CATEGORIES = ['Ambient', 'Chilled', 'Bulky', 'Hazmat', 'Promo'];
const AFFINITY_GROUPS = ['paint-kit', 'safety-kit', 'janitorial', 'fasteners', 'ppe'];

export type SkuSpec = Omit<SkuRow, 'id'>;
export type SlotSpec = Omit<SlotRow, 'id' | 'sku_id'>;

export interface DcSeed {
  skus: SkuSpec[];
  slots: SlotSpec[];
  /** Per-slot SKU code (or null for an empty slot), aligned to `slots` by index. */
  assignments: (string | null)[];
}

/** The physical DC: aisles × bays × levels. bay = depth from dock, aisle = lateral. */
export function generateSlotGrid(): SlotSpec[] {
  const slots: SlotSpec[] = [];
  for (let aisle = 1; aisle <= AISLES; aisle++) {
    for (let bay = 1; bay <= BAYS; bay++) {
      for (let level = 1; level <= LEVELS; level++) {
        const zone = aisle === 1 ? 'chilled' : aisle === 4 ? 'hazmat' : 'ambient';
        const storageType = bay >= 5 || zone === 'hazmat' ? 'bulk' : 'each-pick';
        slots.push({
          aisle,
          bay,
          level,
          x: bay * 2,
          y: aisle * 3,
          zone,
          storageType,
          capacityCube: storageType === 'bulk' ? 180 : 60,
        });
      }
    }
  }
  return slots;
}

export const SLOT_COUNT = AISLES * BAYS * LEVELS;

/** Demo SKUs with Pareto-ish pick rates: a few fast movers, a long slow tail. */
export function generateDemoSkus(): SkuSpec[] {
  const skus: SkuSpec[] = [];
  for (let i = 0; i < SKU_COUNT; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const bulky = category === 'Bulky';
    const promo = category === 'Promo';
    skus.push({
      code: `SKU-${String(i + 1).padStart(3, '0')}`,
      name: `Product ${i + 1}`,
      category,
      picksPerDay: Math.max(1, Math.round(220 / (i + 1))),
      cube: bulky ? 18 + (i % 5) * 4 : 2 + (i % 4),
      weight: bulky ? 18 + (i % 7) : category === 'Hazmat' ? 10 : 2 + (i % 8),
      forecastMultiplier: promo ? 2.5 : i % 13 === 0 ? 1.6 : 1,
      affinityGroup: AFFINITY_GROUPS[i % AFFINITY_GROUPS.length],
    });
  }
  return skus;
}

/**
 * Deliberately BAD starting assignment: fastest movers into the farthest slots.
 * Returns a per-slot SKU code aligned to `slots` by index (null = empty). Used
 * for both the demo seed and freshly imported data so there's always a visible
 * slotting problem to diagnose and a big optimiser win.
 */
export function worstCaseAssignment(
  slots: SlotSpec[],
  skus: SkuSpec[]
): (string | null)[] {
  const skusByPicksDesc = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const slotsByDistDesc = slots
    .map((_, idx) => idx)
    .sort((i, j) => slots[j].x + slots[j].y - (slots[i].x + slots[i].y));

  const assignments: (string | null)[] = new Array(slots.length).fill(null);
  for (let i = 0; i < skusByPicksDesc.length && i < slotsByDistDesc.length; i++) {
    assignments[slotsByDistDesc[i]] = skusByPicksDesc[i].code;
  }
  return assignments;
}

/** Full demo DC: slot grid + demo SKUs + worst-case assignment. */
export function generateDc(): DcSeed {
  const slots = generateSlotGrid();
  const skus = generateDemoSkus();
  return { skus, slots, assignments: worstCaseAssignment(slots, skus) };
}
