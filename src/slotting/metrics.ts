import { DOCK, GOLDEN_LEVEL, type AbcClass, type SkuRow, type SlotRow } from './types';

export interface WorstEntry {
  sku: SkuRow;
  slotId: string;
  /** Extra travel/day caused by this SKU sitting further out than its pick-rank deserves. */
  wasted: number;
}

export interface Metrics {
  healthScore: number;
  totalTravel: number;
  bestTravel: number;
  goldenZoneCompliance: number;
  misslottedCount: number;
  worst: WorstEntry[];
  abc: Map<string, AbcClass>;
}

/** Manhattan distance from a slot to the dock — stands in for aisle walking distance. */
export function distanceToDock(slot: { x: number; y: number }): number {
  return Math.abs(slot.x - DOCK.x) + Math.abs(slot.y - DOCK.y);
}

/**
 * ABC classification by cumulative pick share: A covers the fastest movers up
 * to 80% of total picks, B up to 95%, C the rest. The single biggest mover is
 * always A even if it alone exceeds the 80% band.
 */
export function classifyAbc(skus: SkuRow[]): Map<string, AbcClass> {
  const sorted = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const total = sorted.reduce((sum, s) => sum + s.picksPerDay, 0);
  const out = new Map<string, AbcClass>();
  let cum = 0;
  sorted.forEach((sku, i) => {
    cum += sku.picksPerDay;
    const share = total > 0 ? cum / total : 0;
    let cls: AbcClass = share <= 0.8 ? 'A' : share <= 0.95 ? 'B' : 'C';
    if (i === 0) cls = 'A';
    out.set(sku.id, cls);
  });
  return out;
}

export function totalTravel(slots: SlotRow[], skuById: Map<string, SkuRow>): number {
  let sum = 0;
  for (const slot of slots) {
    if (!slot.sku_id) continue;
    const sku = skuById.get(slot.sku_id);
    if (!sku) continue;
    sum += sku.picksPerDay * distanceToDock(slot);
  }
  return sum;
}

/** Travel if SKUs were greedily assigned: fastest mover to closest slot, and so on. */
export function bestAchievableTravel(slots: SlotRow[], skus: SkuRow[]): number {
  const skusDesc = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const slotsAsc = [...slots].sort((a, b) => distanceToDock(a) - distanceToDock(b));
  const n = Math.min(skusDesc.length, slotsAsc.length);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += skusDesc[i].picksPerDay * distanceToDock(slotsAsc[i]);
  }
  return sum;
}

export function healthScore(current: number, best: number): number {
  if (current <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((100 * best) / current)));
}

export function computeMetrics(slots: SlotRow[], skus: SkuRow[]): Metrics {
  const skuById = new Map(skus.map((s) => [s.id, s]));
  const abc = classifyAbc(skus);
  const current = totalTravel(slots, skuById);
  const best = bestAchievableTravel(slots, skus);

  // Golden-zone compliance: of all A-class picks, how many are served from a
  // golden-zone slot (reach height).
  const slotBySkuId = new Map<string, SlotRow>();
  for (const slot of slots) if (slot.sku_id) slotBySkuId.set(slot.sku_id, slot);
  let aPicks = 0;
  let aPicksGolden = 0;
  for (const sku of skus) {
    if (abc.get(sku.id) !== 'A') continue;
    aPicks += sku.picksPerDay;
    const slot = slotBySkuId.get(sku.id);
    if (slot && slot.level === GOLDEN_LEVEL) aPicksGolden += sku.picksPerDay;
  }
  const goldenZoneCompliance = aPicks > 0 ? aPicksGolden / aPicks : 1;

  // Worst-slotted: compare each SKU's current distance to the distance it would
  // have at its pick-rank in an ideal layout. Positive gap = wasted travel.
  const skusDesc = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const idealDistByRank = [...slots]
    .sort((a, b) => distanceToDock(a) - distanceToDock(b))
    .map(distanceToDock);
  const rankBySkuId = new Map<string, number>();
  skusDesc.forEach((s, i) => rankBySkuId.set(s.id, i));

  const worst: WorstEntry[] = [];
  let misslottedCount = 0;
  for (const slot of slots) {
    if (!slot.sku_id) continue;
    const sku = skuById.get(slot.sku_id);
    if (!sku) continue;
    const rank = rankBySkuId.get(sku.id) ?? 0;
    const idealDist = idealDistByRank[rank] ?? 0;
    const wasted = sku.picksPerDay * (distanceToDock(slot) - idealDist);
    if (wasted > 0) {
      misslottedCount++;
      worst.push({ sku, slotId: slot.id, wasted });
    }
  }
  worst.sort((a, b) => b.wasted - a.wasted);

  return {
    healthScore: healthScore(current, best),
    totalTravel: current,
    bestTravel: best,
    goldenZoneCompliance,
    misslottedCount,
    worst: worst.slice(0, 8),
    abc,
  };
}
