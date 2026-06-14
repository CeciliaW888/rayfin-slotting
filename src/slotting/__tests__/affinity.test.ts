import { describe, expect, it } from 'vitest';

import { learnedGroups, mineAffinities } from '@/slotting/affinity';
import type { Order } from '@/slotting/orders';
import type { SkuRow } from '@/slotting/types';

function sku(id: string): SkuRow {
  return { id, code: id, name: id, category: 'x', picksPerDay: 1 };
}
function order(id: string, ...skuIds: string[]): Order {
  return { id, lines: skuIds.map((skuId) => ({ skuId, qty: 1 })) };
}

describe('mineAffinities', () => {
  const skus = [sku('a'), sku('b'), sku('c'), sku('z')];

  it('finds pairs that co-occur more than chance (high lift first)', () => {
    // a & b always together; z is a loner.
    const orders = [
      order('1', 'a', 'b'),
      order('2', 'a', 'b'),
      order('3', 'a', 'b', 'c'),
      order('4', 'c', 'z'),
      order('5', 'z'),
    ];
    const pairs = mineAffinities(orders, skus, { minCount: 2, minLift: 1 });
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0].a).toBe('a');
    expect(pairs[0].b).toBe('b');
    expect(pairs[0].lift).toBeGreaterThan(1);
  });

  it('returns nothing when there are no multi-item baskets', () => {
    expect(mineAffinities([order('1', 'a'), order('2', 'b')], skus)).toHaveLength(0);
  });

  it('clusters connected pairs into one learned group', () => {
    const orders = [order('1', 'a', 'b'), order('2', 'a', 'b'), order('3', 'b', 'c'), order('4', 'b', 'c')];
    const groups = learnedGroups(mineAffinities(orders, skus, { minCount: 2, minLift: 1 }));
    expect(groups.get('a')).toBe(groups.get('c')); // a–b–c connected
  });
});
