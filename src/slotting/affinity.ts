import type { Order } from './orders';
import type { SkuRow } from './types';

/**
 * Market-basket association mining (Apriori-style) over the order book. For each
 * co-occurring SKU pair we compute support (how often they share a basket),
 * confidence, and lift (how much more often than chance). This is genuine
 * unsupervised learning — the affinity groups are *discovered* from real orders
 * rather than hand-labelled in the seed data.
 */
export interface AffinityPair {
  a: string;
  b: string;
  count: number;
  support: number;
  confidence: number;
  lift: number;
}

interface MineOptions {
  minCount?: number;
  minLift?: number;
  topN?: number;
}

export function mineAffinities(orders: Order[], skus: SkuRow[], opts: MineOptions = {}): AffinityPair[] {
  const { minCount = 2, minLift = 1.2, topN = 12 } = opts;
  const known = new Set(skus.map((s) => s.id));
  const baskets = orders
    .map((o) => [...new Set(o.lines.map((l) => l.skuId).filter((id) => known.has(id)))])
    .filter((b) => b.length >= 2);
  const n = baskets.length;
  if (n === 0) return [];

  const itemCount = new Map<string, number>();
  const pairCount = new Map<string, number>();
  for (const basket of baskets) {
    for (const id of basket) itemCount.set(id, (itemCount.get(id) ?? 0) + 1);
    for (let i = 0; i < basket.length; i++) {
      for (let j = i + 1; j < basket.length; j++) {
        const [a, b] = basket[i] < basket[j] ? [basket[i], basket[j]] : [basket[j], basket[i]];
        const key = `${a}|${b}`;
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
      }
    }
  }

  const pairs: AffinityPair[] = [];
  for (const [key, count] of pairCount) {
    if (count < minCount) continue;
    const [a, b] = key.split('|');
    const ca = itemCount.get(a) ?? 1;
    const cb = itemCount.get(b) ?? 1;
    const lift = (count * n) / (ca * cb);
    if (lift < minLift) continue;
    pairs.push({ a, b, count, support: count / n, confidence: Math.max(count / ca, count / cb), lift });
  }
  return pairs.sort((x, y) => y.lift - x.lift || y.count - x.count).slice(0, topN);
}

/** Union-find: cluster SKUs connected by mined pairs into learned affinity groups. */
export function learnedGroups(pairs: AffinityPair[]): Map<string, string> {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    return root;
  };
  for (const p of pairs) {
    const ra = find(p.a);
    const rb = find(p.b);
    if (ra !== rb) parent.set(ra, rb);
  }
  const groups = new Map<string, string>();
  for (const id of parent.keys()) groups.set(id, `learned:${find(id)}`);
  return groups;
}
