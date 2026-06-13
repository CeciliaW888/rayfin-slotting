import { classifyAbc } from './metrics';
import type { AbcClass, SkuRow, SlotRow } from './types';

export type ViewMode = 'abc' | 'heat';

export const ABC_COLOR: Record<AbcClass, string> = {
  A: '#c4825a',
  B: '#cdb79a',
  C: '#aec3c9',
};
export const EMPTY_COLOR = '#e7ded2';

// Cold (few picks) → hot (many picks): lerp blue-grey → terracotta-red.
export function heatColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const cold = [122, 160, 176];
  const hot = [196, 82, 46];
  const ch = cold.map((v, i) => Math.round(v + (hot[i] - v) * clamped));
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

  const maxPicks = skus.reduce((m, s) => Math.max(m, s.picksPerDay), 1);
  for (const slot of slots) {
    const sku = slot.sku_id ? skuById.get(slot.sku_id) : undefined;
    out.set(slot.id, sku ? heatColor(sku.picksPerDay / maxPicks) : EMPTY_COLOR);
  }
  return out;
}
