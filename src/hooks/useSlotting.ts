import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getSkus,
  getSlots,
  importSkus,
  reslot,
  seedIfEmpty,
} from '@/services/slotting';
import { parseSkuCsv } from '@/slotting/csv';
import { computeMetrics, type Metrics } from '@/slotting/metrics';
import { optimizeSlots } from '@/slotting/optimize';
import { generateDemoOrders, type Order } from '@/slotting/orders';
import { recommendMoves, type MoveRecommendation } from '@/slotting/recommendations';
import { SLOT_COUNT } from '@/slotting/seed';
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
  recommendations: MoveRecommendation[];
  orders: Order[];
  isSimulating: boolean;
  applying: boolean;
  importing: boolean;
  importError: string | null;
  simulate: () => void;
  revert: () => void;
  apply: () => Promise<void>;
  importCsv: (file: File) => Promise<void>;
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
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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
  const recommendations = useMemo(
    () => (actualSlots.length ? recommendMoves(actualSlots, skus, { maxRecommendations: 12 }) : []),
    [actualSlots, skus]
  );
  const orders = useMemo(() => (skus.length ? generateDemoOrders(skus, 40) : []), [skus]);

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

  const importCsv = useCallback(
    async (file: File) => {
      setImporting(true);
      setImportError(null);
      try {
        const text = await file.text();
        const { skus: parsed, errors } = parseSkuCsv(text);
        if (parsed.length === 0) {
          setImportError(errors[0] ?? 'No valid rows found in the file.');
          return;
        }
        await importSkus(parsed.slice(0, SLOT_COUNT));
        setSimulatedSlots(null);
        await reload();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed.');
      } finally {
        setImporting(false);
      }
    },
    [reload]
  );

  return {
    loading,
    skus,
    displaySlots,
    metrics,
    baselineMetrics,
    recommendations,
    orders,
    isSimulating: simulatedSlots !== null,
    applying,
    importing,
    importError,
    simulate,
    revert,
    apply,
    importCsv,
  };
}
