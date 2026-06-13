import { useEffect, useMemo, useState } from 'react';

import { KpiPanel } from '@/components/KpiPanel';
import { ViewControls } from '@/components/ViewControls';
import { WorstSlottedList } from '@/components/WorstSlottedList';
import { useAuth } from '@/hooks/AuthContext';
import { WarehouseScene } from '@/scene/WarehouseScene';
import { slotColors, type ViewMode } from '@/slotting/colors';
import { computeMetrics, type Metrics } from '@/slotting/metrics';
import type { SkuRow, SlotRow } from '@/slotting/types';
import { getSkus, getSlots, seedIfEmpty } from '@/services/slotting';

export function HomePage() {
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [skus, setSkus] = useState<SkuRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('abc');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await seedIfEmpty();
      const [slotRows, skuRows] = await Promise.all([getSlots(), getSkus()]);
      if (cancelled) return;
      setSlots(slotRows);
      setSkus(skuRows);
      setMetrics(computeMetrics(slotRows, skuRows));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const colorById = useMemo(
    () => slotColors(slots, skus, viewMode),
    [slots, skus, viewMode]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Slotting Twin</h1>
        <div className="flex items-center gap-4">
          {user?.email && <span className="text-sm text-gray-600">{user.email}</span>}
          <button
            onClick={() => void signOut()}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      {loading || !metrics ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Building your distribution centre…
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            <WarehouseScene
              slots={slots}
              colorById={colorById}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>
          <aside className="w-96 shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto p-5 space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                View
              </h2>
              <ViewControls mode={viewMode} onChange={setViewMode} />
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Slotting KPIs
              </h2>
              <KpiPanel metrics={metrics} />
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Worst-slotted SKUs
              </h2>
              <WorstSlottedList
                entries={metrics.worst}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
              />
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
