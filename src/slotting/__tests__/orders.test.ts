import { describe, expect, it } from 'vitest';

import { generateDemoOrders, pickRoute, type Order } from '@/slotting/orders';
import { DOCK, type SkuRow, type SlotRow } from '@/slotting/types';

function sku(id: string, picksPerDay = 10, affinityGroup?: string): SkuRow {
  return { id, code: id, name: id, category: 'Ambient', picksPerDay, affinityGroup };
}
function slot(id: string, x: number, y: number, sku_id: string | null): SlotRow {
  return { id, aisle: 1, bay: 1, level: 2, x, y, sku_id };
}

describe('pickRoute', () => {
  const slots = [
    slot('near', DOCK.x - 1, DOCK.y, 'a'),
    slot('mid', DOCK.x - 5, DOCK.y, 'b'),
    slot('far', DOCK.x - 10, DOCK.y, 'c'),
  ];

  it('sequences stops nearest-to-dock first and returns to the dock', () => {
    const order: Order = { id: 'O1', lines: [{ skuId: 'c', qty: 1 }, { skuId: 'a', qty: 1 }, { skuId: 'b', qty: 1 }] };
    const route = pickRoute(order, slots);
    expect(route.stops.map((s) => s.slotId)).toEqual(['near', 'mid', 'far']);
    // dock→near(1) + near→mid(4) + mid→far(5) + far→dock(10) = 20
    expect(route.distance).toBe(20);
  });

  it('skips lines whose SKU is not currently slotted', () => {
    const order: Order = { id: 'O2', lines: [{ skuId: 'a', qty: 1 }, { skuId: 'ghost', qty: 1 }] };
    const route = pickRoute(order, slots);
    expect(route.stops).toHaveLength(1);
    expect(route.stops[0].skuId).toBe('a');
  });
});

describe('generateDemoOrders', () => {
  it('is deterministic for a given seed', () => {
    const skus = [sku('a', 50, 'g1'), sku('b', 5, 'g1'), sku('c', 1)];
    const a = generateDemoOrders(skus, 10, 42);
    const b = generateDemoOrders(skus, 10, 42);
    expect(a).toEqual(b);
    expect(a).toHaveLength(10);
    expect(a.every((o) => o.lines.length > 0)).toBe(true);
  });
});
