import { useMemo, useState } from 'react';

import { ImportControls } from '@/components/ImportControls';
import { KpiPanel } from '@/components/KpiPanel';
import { SimulationControls } from '@/components/SimulationControls';
import { ViewControls } from '@/components/ViewControls';
import { WorstSlottedList } from '@/components/WorstSlottedList';
import { useAuth } from '@/hooks/AuthContext';
import { useSlotting } from '@/hooks/useSlotting';
import { WarehouseScene } from '@/scene/WarehouseScene';
import { slotColors, type ViewMode } from '@/slotting/colors';

export function HomePage() {
  const { signOut, user } = useAuth();
  const {
    loading,
    skus,
    displaySlots,
    metrics,
    baselineMetrics,
    isSimulating,
    applying,
    importing,
    importError,
    simulate,
    revert,
    apply,
    importCsv,
  } = useSlotting();

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('abc');

  const colorById = useMemo(
    () => slotColors(displaySlots, skus, viewMode),
    [displaySlots, skus, viewMode]
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
              slots={displaySlots}
              colorById={colorById}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>
          <aside className="w-96 shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto p-5 space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                What-if
              </h2>
              <SimulationControls
                baseline={baselineMetrics}
                projected={metrics}
                isSimulating={isSimulating}
                applying={applying}
                onSimulate={simulate}
                onApply={() => void apply()}
                onRevert={revert}
              />
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                View
              </h2>
              <ViewControls mode={viewMode} onChange={setViewMode} />
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Data
              </h2>
              <ImportControls
                importing={importing}
                error={importError}
                onImport={(file) => void importCsv(file)}
              />
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
