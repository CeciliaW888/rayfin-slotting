import { useCallback, useEffect, useMemo, useState } from 'react';

import { getSkus, getSlots, reslot, seedIfEmpty } from '@/services/slotting';
import { computeMetrics, type Metrics } from '@/slotting/metrics';
import { optimizeSlots } from '@/slotting/optimize';
import type { SkuRow, SlotRow } from '@/slotting/types';

export interface Slotting {
  loading: boolean;
  skus: SkuRow[];
  /** Slots to render — the simulated layout while simulating, otherwise actual. */
  displaySlots: SlotRow[];
  /** Metrics for the displayed (possibly simulated) layout. */
  metrics: Metrics | null;
  /** Metrics for the real persisted layout — the "before" baseline. */
  baselineMetrics: Metrics | null;
  isSimulating: boolean;
  applying: boolean;
  simulate: () => void;
  revert: () => void;
  apply: () => Promise<void>;
}

/**
 * Owns the slotting data lifecycle: seed-on-first-load, read, and the what-if
 * simulation (an in-memory optimised layout that can be applied or reverted).
 * Keeping this here leaves the page as pure composition.
 */
export function useSlotting(): Slotting {
  const [loading, setLoading] = useState(true);
  const [skus, setSkus] = useState<SkuRow[]>([]);
  const [actualSlots, setActualSlots] = useState<SlotRow[]>([]);
  const [simulatedSlots, setSimulatedSlots] = useState<SlotRow[] | null>(null);
  const [applying, setApplying] = useState(false);

  const reload = useCallback(async () => {
    const [slotRows, skuRows] = await Promise.all([getSlots(), getSkus()]);
    setActualSlots(slotRows);
    setSkus(skuRows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await seedIfEmpty();
      if (cancelled) return;
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const displaySlots = simulatedSlots ?? actualSlots;

  const baselineMetrics = useMemo(
    () => (actualSlots.length ? computeMetrics(actualSlots, skus) : null),
    [actualSlots, skus]
  );
  const metrics = useMemo(
    () => (displaySlots.length ? computeMetrics(displaySlots, skus) : null),
    [displaySlots, skus]
  );

  const simulate = useCallback(
    () => setSimulatedSlots(optimizeSlots(actualSlots, skus)),
    [actualSlots, skus]
  );

  const revert = useCallback(() => setSimulatedSlots(null), []);

  const apply = useCallback(async () => {
    if (!simulatedSlots) return;
    setApplying(true);
    try {
      const actualById = new Map(actualSlots.map((s) => [s.id, s]));
      for (const slot of simulatedSlots) {
        const prev = actualById.get(slot.id);
        const before = prev?.sku_id ?? null;
        const after = slot.sku_id ?? null;
        if (before !== after) await reslot(slot.id, after);
      }
      setSimulatedSlots(null);
      await reload();
    } finally {
      setApplying(false);
    }
  }, [simulatedSlots, actualSlots, reload]);

  return {
    loading,
    skus,
    displaySlots,
    metrics,
    baselineMetrics,
    isSimulating: simulatedSlots !== null,
    applying,
    simulate,
    revert,
    apply,
  };
}
