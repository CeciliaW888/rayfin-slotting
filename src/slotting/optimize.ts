import { distanceToDock } from './metrics';
import { forecastedPicks, isCompatible } from './recommendations';
import { DEFAULT_RULES, type RuleSet } from './rules';
import type { SkuRow, SlotRow } from './types';

/**
 * Greedy optimal slotting: assign the fastest-moving SKU to the closest slot,
 * the next fastest to the next closest, and so on. Returns a NEW slots array
 * (no mutation); any leftover slots are left empty. This is the same assignment
 * `bestAchievableTravel` scores, so the simulated travel matches that bound.
 */
export function optimizeSlots(slots: SlotRow[], skus: SkuRow[], rules: RuleSet = DEFAULT_RULES): SlotRow[] {
  const skusDesc = [...skus].sort((a, b) => forecastedPicks(b) - forecastedPicks(a));
  const openSlots = [...slots].sort((a, b) => distanceToDock(a) - distanceToDock(b));
  const next: SlotRow[] = slots.map((s) => ({ ...s, sku_id: null }));
  const byId = new Map(next.map((s) => [s.id, s]));

  for (const sku of skusDesc) {
    const index = openSlots.findIndex((slot) => isCompatible(sku, slot, rules));
    if (index === -1) continue;
    const [slot] = openSlots.splice(index, 1);
    const target = byId.get(slot.id);
    if (target) target.sku_id = sku.id;
  }
  return next;
}
