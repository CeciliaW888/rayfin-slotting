import { describe, expect, it } from 'vitest';

import {
  bestAchievableTravel,
  classifyAbc,
  computeMetrics,
  distanceToDock,
  healthScore,
  totalTravel,
} from '@/slotting/metrics';
import type { SkuRow, SlotRow } from '@/slotting/types';

function sku(id: string, picksPerDay: number): SkuRow {
  return { id, code: id, name: id, category: 'x', picksPerDay };
}
function slot(
  id: string,
  x: number,
  y: number,
  level = 2,
  sku_id: string | null = null
): SlotRow {
  return { id, aisle: 1, bay: 1, level, x, y, sku_id };
}

describe('distanceToDock', () => {
  it('is Manhattan distance from the origin', () => {
    expect(distanceToDock({ x: 3, y: 4 })).toBe(7);
    expect(distanceToDock({ x: 0, y: 0 })).toBe(0);
  });
});

describe('classifyAbc', () => {
  it('puts the biggest movers in A and the slow tail in C', () => {
    const abc = classifyAbc([sku('a', 100), sku('b', 10), sku('c', 5), sku('d', 1)]);
    expect(abc.get('a')).toBe('A');
    expect(abc.get('d')).toBe('C');
  });

  it('always marks the single largest mover as A', () => {
    expect(classifyAbc([sku('a', 1000), sku('b', 1)]).get('a')).toBe('A');
  });
});

describe('totalTravel', () => {
  it('sums picks × distance for occupied slots only', () => {
    const skus = [sku('s1', 10)];
    const skuById = new Map(skus.map((s) => [s.id, s]));
    const slots = [slot('a', 2, 3, 2, 's1'), slot('b', 5, 5, 2, null)];
    expect(totalTravel(slots, skuById)).toBe(50); // 10 × (2+3)
  });
});

describe('bestAchievableTravel', () => {
  it('assigns fastest movers to the closest slots', () => {
    const skus = [sku('fast', 10), sku('slow', 1)];
    const slots = [slot('near', 1, 0), slot('far', 9, 0)];
    expect(bestAchievableTravel(slots, skus)).toBe(19); // 10×1 + 1×9
  });

  it('is never worse than the current layout', () => {
    const skus = [sku('fast', 10), sku('slow', 1)];
    const skuById = new Map(skus.map((s) => [s.id, s]));
    const bad = [slot('near', 1, 0, 2, 'slow'), slot('far', 9, 0, 2, 'fast')];
    expect(bestAchievableTravel(bad, skus)).toBeLessThanOrEqual(totalTravel(bad, skuById));
  });
});

describe('healthScore', () => {
  it('is 100 when current equals best', () => {
    expect(healthScore(50, 50)).toBe(100);
  });

  it('drops as current exceeds best and clamps sensibly', () => {
    expect(healthScore(100, 50)).toBe(50);
    expect(healthScore(0, 0)).toBe(100);
  });
});

describe('computeMetrics', () => {
  it('flags a fast mover in a far slot as the worst offender', () => {
    const skus = [sku('fast', 100), sku('slow', 1)];
    const slots = [slot('near', 1, 0, 2, 'slow'), slot('far', 9, 0, 2, 'fast')];
    const m = computeMetrics(slots, skus);
    expect(m.misslottedCount).toBeGreaterThan(0);
    expect(m.worst[0].sku.id).toBe('fast');
    expect(m.healthScore).toBeLessThan(100);
  });

  it('reports an optimal layout as 100 with no mis-slots', () => {
    const skus = [sku('fast', 100), sku('slow', 1)];
    const slots = [slot('near', 1, 0, 2, 'fast'), slot('far', 9, 0, 2, 'slow')];
    const m = computeMetrics(slots, skus);
    expect(m.healthScore).toBe(100);
    expect(m.misslottedCount).toBe(0);
    expect(m.worst).toHaveLength(0);
  });
});
