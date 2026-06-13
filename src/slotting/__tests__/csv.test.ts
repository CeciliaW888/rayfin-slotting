import { describe, expect, it } from 'vitest';

import { parseSkuCsv } from '@/slotting/csv';

describe('parseSkuCsv', () => {
  it('parses a well-formed CSV', () => {
    const text = 'code,name,category,picksPerDay\nA1,Widget,Tools,42\nB2,Gadget,Tools,7';
    const { skus, errors } = parseSkuCsv(text);
    expect(errors).toHaveLength(0);
    expect(skus).toHaveLength(2);
    expect(skus[0]).toMatchObject({
      code: 'A1',
      name: 'Widget',
      category: 'Tools',
      picksPerDay: 42,
    });
  });

  it('accepts header aliases (sku, picks)', () => {
    const { skus } = parseSkuCsv('sku,name,category,picks\nA1,Widget,Tools,42');
    expect(skus[0].code).toBe('A1');
    expect(skus[0].picksPerDay).toBe(42);
  });

  it('parses optional AI slotting signals when present', () => {
    const text = 'code,name,category,picksPerDay,cube,weight,forecastMultiplier,affinityGroup\nA1,Widget,Ambient,42,3.5,9,1.8,order-kit';
    const { skus, errors } = parseSkuCsv(text);
    expect(errors).toHaveLength(0);
    expect(skus[0]).toMatchObject({
      cube: 3.5,
      weight: 9,
      forecastMultiplier: 1.8,
      affinityGroup: 'order-kit',
    });
  });

  it('skips rows with an invalid pick rate but keeps valid ones', () => {
    const text = 'code,name,category,picksPerDay\nA1,Widget,Tools,abc\nB2,Gadget,Tools,7';
    const { skus, errors } = parseSkuCsv(text);
    expect(skus).toHaveLength(1);
    expect(skus[0].code).toBe('B2');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('errors when required columns are missing', () => {
    const { skus, errors } = parseSkuCsv('foo,bar\n1,2');
    expect(skus).toHaveLength(0);
    expect(errors[0]).toMatch(/columns/i);
  });

  it('errors on header-only input', () => {
    const { skus, errors } = parseSkuCsv('code,name,category,picksPerDay');
    expect(skus).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });
});
