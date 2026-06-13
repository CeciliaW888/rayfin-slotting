import { useMemo, useState } from 'react';

import { ImportControls } from '@/components/ImportControls';
import { IntelligenceSummary } from '@/components/IntelligenceSummary';
import { KpiPanel } from '@/components/KpiPanel';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
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
    recommendations,
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
    <div className="flex min-h-screen flex-col bg-gray-50 md:h-screen">
      <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:items-center md:px-8">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Rayfin Slotting AI Twin</h1>
          <p className="mt-1 text-xs text-gray-500">
            Dynamic recommendations using velocity, forecast, affinity, cube and fit rules
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {user?.email && <span className="hidden text-sm text-gray-600 sm:inline">{user.email}</span>}
          <button
            onClick={() => void signOut()}
            className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      {loading || !metrics ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Building your distribution centre…
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-x-hidden md:min-h-0 md:flex-row">
          <div className="h-[42vh] min-h-[280px] w-full shrink-0 md:h-auto md:min-h-0 md:flex-1">
            <WarehouseScene
              slots={displaySlots}
              colorById={colorById}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>
          <aside className="w-full shrink-0 space-y-6 border-t border-gray-200 bg-gray-50 p-4 md:w-96 md:overflow-y-auto md:border-l md:border-t-0 md:p-5">
            <section>
              <IntelligenceSummary recommendations={recommendations} skus={skus} />
            </section>
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
                AI move recommendations
              </h2>
              <RecommendationsPanel
                recommendations={recommendations}
                skus={skus}
                slots={displaySlots}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
              />
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
