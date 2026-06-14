import { distanceToDock } from './metrics';
import { DOCK, type SkuRow, type SlotRow } from './types';

export interface OrderLine {
  skuId: string;
  qty: number;
}

export interface Order {
  id: string;
  lines: OrderLine[];
}

export interface RouteStop {
  slotId: string;
  skuId: string;
  x: number;
  y: number;
}

export interface PickRoute {
  orderId: string;
  stops: RouteStop[];
  /** Total Manhattan travel: dock → each stop in sequence → dock. */
  distance: number;
}

// Small deterministic PRNG so demo orders are stable for a given seed.
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

/**
 * Synthetic order book. SKUs are drawn with probability proportional to pick
 * rate (fast movers appear in more orders), and each order has a chance of
 * pulling its first SKU's whole affinity group — mirroring how baskets cluster.
 */
export function generateDemoOrders(skus: SkuRow[], count = 40, seed = 7): Order[] {
  if (skus.length === 0) return [];
  const rand = lcg(seed);
  const totalPicks = skus.reduce((sum, s) => sum + Math.max(1, s.picksPerDay), 0);

  const pickWeighted = (): SkuRow => {
    let r = rand() * totalPicks;
    for (const s of skus) {
      r -= Math.max(1, s.picksPerDay);
      if (r <= 0) return s;
    }
    return skus[skus.length - 1];
  };

  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const ids = new Set<string>();
    const first = pickWeighted();
    ids.add(first.id);

    if (first.affinityGroup && rand() < 0.5) {
      for (const s of skus) {
        if (s.affinityGroup === first.affinityGroup && rand() < 0.4) ids.add(s.id);
      }
    }
    const extra = 1 + Math.floor(rand() * 4);
    for (let j = 0; j < extra; j++) ids.add(pickWeighted().id);

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      lines: [...ids].map((skuId) => ({ skuId, qty: 1 + Math.floor(rand() * 6) })),
    });
  }
  return orders;
}

/**
 * Resolve an order's lines to slot locations and sequence them with a greedy
 * nearest-neighbour walk starting and ending at the dock. Lines whose SKU
 * isn't currently slotted are skipped.
 */
export function pickRoute(order: Order, slots: SlotRow[]): PickRoute {
  const slotBySku = new Map<string, SlotRow>();
  for (const slot of slots) if (slot.sku_id) slotBySku.set(slot.sku_id, slot);

  const remaining: RouteStop[] = [];
  for (const line of order.lines) {
    const slot = slotBySku.get(line.skuId);
    if (slot) remaining.push({ slotId: slot.id, skuId: line.skuId, x: slot.x, y: slot.y });
  }

  const stops: RouteStop[] = [];
  let cx = DOCK.x;
  let cy = DOCK.y;
  let distance = 0;
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = manhattan(cx, cy, remaining[i].x, remaining[i].y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const next = remaining.splice(best, 1)[0];
    distance += bestD;
    stops.push(next);
    cx = next.x;
    cy = next.y;
  }
  if (stops.length) distance += manhattan(cx, cy, DOCK.x, DOCK.y);

  return { orderId: order.id, stops, distance };
}

/** Convenience for sorting/labelling: a route's furthest single-pick reach. */
export function routeReach(route: PickRoute): number {
  return route.stops.reduce(
    (max, s) => Math.max(max, distanceToDock({ x: s.x, y: s.y } as SlotRow)),
    0
  );
}
