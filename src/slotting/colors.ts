import { classifyAbc } from './metrics';
import { forecastedPicks, isCompatible } from './recommendations';
import type { AbcClass, SkuRow, SlotRow } from './types';

export type ViewMode = 'abc' | 'heat' | 'forecast' | 'compatibility';

// Data colours are deliberately kept OFF the terracotta accent (which means
// "selected/clickable" everywhere) so heat/A-class never reads as "selected".
export const ABC_COLOR: Record<AbcClass, string> = {
  A: '#b3472f', // brick red
  B: '#d8a657', // amber
  C: '#5f8aa6', // slate blue
};
export const EMPTY_COLOR = '#e7ded2';

// Sequential heat ramp: cold grey-green → amber → brick (never the accent).
export function heatColor(t: number): string {
  const c = Math.max(0, Math.min(1, t));
  const cold = [207, 216, 211]; // #cfd8d3
  const mid = [216, 166, 87]; // #d8a657
  const hot = [179, 71, 47]; // #b3472f
  const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
  const ch =
    c < 0.5
      ? cold.map((v, i) => lerp(v, mid[i], c / 0.5))
      : mid.map((v, i) => lerp(v, hot[i], (c - 0.5) / 0.5));
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

/**
 * Resolve a colour per slot for the current view mode. This is the single
 * place that maps domain data → colour; the 3D scene just renders what it's
 * handed, so it never recomputes ABC or heat logic itself.
 */
export function slotColors(
  slots: SlotRow[],
  skus: SkuRow[],
  mode: ViewMode
): Map<string, string> {
  const skuById = new Map(skus.map((s) => [s.id, s]));
  const out = new Map<string, string>();

  if (mode === 'abc') {
    const abc = classifyAbc(skus);
    for (const slot of slots) {
      const cls = slot.sku_id ? abc.get(slot.sku_id) : undefined;
      out.set(slot.id, cls ? ABC_COLOR[cls] : EMPTY_COLOR);
    }
    return out;
  }

  if (mode === 'compatibility') {
    for (const slot of slots) {
      const sku = slot.sku_id ? skuById.get(slot.sku_id) : undefined;
      out.set(slot.id, !sku || isCompatible(sku, slot) ? '#6f9a6a' : '#b3472f');
    }
    return out;
  }

  const value = (sku: SkuRow) => (mode === 'forecast' ? forecastedPicks(sku) : sku.picksPerDay);
  const maxPicks = skus.reduce((m, s) => Math.max(m, value(s)), 1);
  for (const slot of slots) {
    const sku = slot.sku_id ? skuById.get(slot.sku_id) : undefined;
    out.set(slot.id, sku ? heatColor(value(sku) / maxPicks) : EMPTY_COLOR);
  }
  return out;
}
