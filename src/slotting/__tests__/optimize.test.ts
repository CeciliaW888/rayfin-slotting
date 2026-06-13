import { describe, expect, it } from 'vitest';

import { optimizeSlots } from '@/slotting/optimize';
import type { SkuRow, SlotRow } from '@/slotting/types';

function sku(id: string, picksPerDay: number): SkuRow {
  return { id, code: id, name: id, category: 'x', picksPerDay };
}
function slot(id: string, x: number, y: number): SlotRow {
  return { id, aisle: 1, bay: 1, level: 2, x, y, sku_id: null };
}

describe('optimizeSlots', () => {
  it('places the fastest mover in the closest slot', () => {
    const skus = [sku('fast', 100), sku('slow', 1)];
    const slots = [slot('far', 9, 0), slot('near', 1, 0)];
    const next = optimizeSlots(slots, skus);
    expect(next.find((s) => s.id === 'near')?.sku_id).toBe('fast');
    expect(next.find((s) => s.id === 'far')?.sku_id).toBe('slow');
  });

  it('does not mutate the input slots', () => {
    const slots = [slot('s', 1, 0)];
    optimizeSlots(slots, [sku('a', 5)]);
    expect(slots[0].sku_id).toBeNull();
  });

  it('leaves extra slots empty when there are fewer SKUs than slots', () => {
    const next = optimizeSlots([slot('s1', 1, 0), slot('s2', 2, 0)], [sku('a', 5)]);
    expect(next.filter((s) => s.sku_id === null)).toHaveLength(1);
  });
});
