import { describe, expect, it } from 'vitest';

import { recommendMoves } from '@/slotting/recommendations';
import { DOCK, type SkuRow, type SlotRow } from '@/slotting/types';

function sku(overrides: Partial<SkuRow> & Pick<SkuRow, 'id' | 'picksPerDay'>): SkuRow {
  const { id, picksPerDay, ...rest } = overrides;
  return {
    id,
    code: id,
    name: id,
    category: 'Ambient',
    picksPerDay,
    ...rest,
  };
}

function slot(overrides: Partial<SlotRow> & Pick<SlotRow, 'id' | 'x' | 'y'>): SlotRow {
  const { id, x, y, ...rest } = overrides;
  return {
    id,
    aisle: 1,
    bay: 1,
    level: 2,
    x,
    y,
    sku_id: null,
    storageType: 'each-pick',
    zone: 'ambient',
    capacityCube: 100,
    ...rest,
  };
}

const near = { x: DOCK.x - 1, y: DOCK.y };
const far = { x: 1, y: 0 };

describe('recommendMoves', () => {
  it('ranks high payback swaps and explains the ROI drivers', () => {
    const fast = sku({ id: 'fast', picksPerDay: 120, cube: 2, affinityGroup: 'A' });
    const slow = sku({ id: 'slow', picksPerDay: 5, cube: 1, affinityGroup: 'B' });
    const slots = [
      slot({ id: 'far', x: far.x, y: far.y, sku_id: fast.id }),
      slot({ id: 'near', x: near.x, y: near.y, sku_id: slow.id }),
    ];

    const [rec] = recommendMoves(slots, [fast, slow], { maxRecommendations: 3 });

    expect(rec.fromSlotId).toBe('far');
    expect(rec.toSlotId).toBe('near');
    expect(rec.skuId).toBe('fast');
    expect(rec.annualSavings).toBeGreaterThan(rec.moveCost);
    expect(rec.paybackDays).toBeLessThan(30);
    expect(rec.reasonCodes).toContain('velocity');
  });

  it('lists a reciprocal swap only once', () => {
    const fast = sku({ id: 'fast', picksPerDay: 120 });
    const slow = sku({ id: 'slow', picksPerDay: 5 });
    const slots = [
      slot({ id: 'far', x: far.x, y: far.y, sku_id: fast.id }),
      slot({ id: 'near', x: near.x, y: near.y, sku_id: slow.id }),
    ];

    const recs = recommendMoves(slots, [fast, slow]);

    expect(recs).toHaveLength(1);
  });

  it('respects zoning and never recommends a dangerous-goods SKU into a general slot', () => {
    const dgFast = sku({ id: 'solvent', category: 'Welding', picksPerDay: 200, cube: 1 });
    const generalSlow = sku({ id: 'bolts', category: 'Fasteners', picksPerDay: 1, cube: 1 });
    const slots = [
      slot({ id: 'dg-far', x: far.x, y: far.y, sku_id: dgFast.id, zone: 'dangerous-goods' }),
      slot({ id: 'general-near', x: near.x, y: near.y, sku_id: generalSlow.id, zone: 'general' }),
    ];

    const recs = recommendMoves(slots, [dgFast, generalSlow]);

    expect(recs.find((r) => r.skuId === 'solvent' && r.toSlotId === 'general-near')).toBeUndefined();
  });

  it('uses forecast uplift so a promo item can outrank a historically faster SKU', () => {
    const promo = sku({ id: 'promo', category: 'Ambient', picksPerDay: 20, forecastMultiplier: 8 });
    const steady = sku({ id: 'steady', category: 'Ambient', picksPerDay: 100, forecastMultiplier: 1 });
    const slots = [
      slot({ id: 'far', x: far.x, y: far.y, sku_id: promo.id }),
      slot({ id: 'near', x: near.x, y: near.y, sku_id: steady.id }),
    ];

    const [rec] = recommendMoves(slots, [promo, steady]);

    expect(rec.skuId).toBe('promo');
    expect(rec.reasonCodes).toContain('forecast');
  });
});
