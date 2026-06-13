import { distanceToDock } from './metrics';
import type { SkuRow, SlotRow } from './types';

/**
 * Greedy optimal slotting: assign the fastest-moving SKU to the closest slot,
 * the next fastest to the next closest, and so on. Returns a NEW slots array
 * (no mutation); any leftover slots are left empty. This is the same assignment
 * `bestAchievableTravel` scores, so the simulated travel matches that bound.
 */
export function optimizeSlots(slots: SlotRow[], skus: SkuRow[]): SlotRow[] {
  const skusDesc = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const slotsAsc = [...slots].sort(
    (a, b) => distanceToDock(a) - distanceToDock(b)
  );
  const next: SlotRow[] = slots.map((s) => ({ ...s, sku_id: null }));
  const byId = new Map(next.map((s) => [s.id, s]));

  const n = Math.min(skusDesc.length, slotsAsc.length);
  for (let i = 0; i < n; i++) {
    const target = byId.get(slotsAsc[i].id);
    if (target) target.sku_id = skusDesc[i].id;
  }
  return next;
}
