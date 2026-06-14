import { describe, expect, it } from 'vitest';

import { optimizeSlots } from '@/slotting/optimize';
import { DOCK, type SkuRow, type SlotRow } from '@/slotting/types';

function sku(id: string, picksPerDay: number): SkuRow {
  return { id, code: id, name: id, category: 'x', picksPerDay };
}
function slot(id: string, x: number, y: number): SlotRow {
  return { id, aisle: 1, bay: 1, level: 2, x, y, sku_id: null };
}

const NEAR_DOCK = { x: DOCK.x - 1, y: DOCK.y };
const FAR_FROM_DOCK = { x: 1, y: 0 };

describe('optimizeSlots', () => {
  it('places the fastest mover in the closest slot', () => {
    const skus = [sku('fast', 100), sku('slow', 1)];
    const slots = [
      slot('far', FAR_FROM_DOCK.x, FAR_FROM_DOCK.y),
      slot('near', NEAR_DOCK.x, NEAR_DOCK.y),
    ];
    const next = optimizeSlots(slots, skus);
    expect(next.find((s) => s.id === 'near')?.sku_id).toBe('fast');
    expect(next.find((s) => s.id === 'far')?.sku_id).toBe('slow');
  });

  it('does not mutate the input slots', () => {
    const slots = [slot('s', NEAR_DOCK.x, NEAR_DOCK.y)];
    optimizeSlots(slots, [sku('a', 5)]);
    expect(slots[0].sku_id).toBeNull();
  });

  it('leaves extra slots empty when there are fewer SKUs than slots', () => {
    const next = optimizeSlots(
      [slot('s1', NEAR_DOCK.x, NEAR_DOCK.y), slot('s2', FAR_FROM_DOCK.x, FAR_FROM_DOCK.y)],
      [sku('a', 5)]
    );
    expect(next.filter((s) => s.sku_id === null)).toHaveLength(1);
  });

  it('respects zone compatibility when assigning fastest movers', () => {
    const dangerous = { ...sku('solvent', 200), category: 'Welding' };
    const general = { ...sku('bolts', 10), category: 'Fasteners' };
    const next = optimizeSlots(
      [
        { ...slot('general-near', NEAR_DOCK.x, NEAR_DOCK.y), zone: 'general' },
        { ...slot('dg-far', FAR_FROM_DOCK.x, FAR_FROM_DOCK.y), zone: 'dangerous-goods' },
      ],
      [dangerous, general]
    );
    expect(next.find((s) => s.id === 'dg-far')?.sku_id).toBe('solvent');
    expect(next.find((s) => s.id === 'general-near')?.sku_id).toBe('bolts');
  });
});
