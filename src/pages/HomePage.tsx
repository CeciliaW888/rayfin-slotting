import { useMemo, useState } from 'react';

import { ImportControls } from '@/components/ImportControls';
import { IntelligenceSummary } from '@/components/IntelligenceSummary';
import { ItemsTable } from '@/components/ItemsTable';
import { KpiPanel } from '@/components/KpiPanel';
import { ModuleNav, type ModuleId } from '@/components/ModuleNav';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { SimulationControls } from '@/components/SimulationControls';
import { SlotsTable } from '@/components/SlotsTable';
import { TwinPanel } from '@/components/TwinPanel';
import { WorstSlottedList } from '@/components/WorstSlottedList';
import { useSlotting } from '@/hooks/useSlotting';
import { slotColors, type ViewMode } from '@/slotting/colors';

function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-gray-200 bg-white px-5 py-3">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-gray-400">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs">On the roadmap — see the digital-twin plan.</p>
    </div>
  );
}

export function HomePage() {
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

  const [active, setActive] = useState<ModuleId>('twin');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('abc');

  const colorById = useMemo(
    () => slotColors(displaySlots, skus, viewMode),
    [displaySlots, skus, viewMode]
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 sm:text-lg">Rayfin Slotting · DC Digital Twin</h1>
          <p className="hidden text-xs text-gray-500 sm:block">
            OptiSlot-style workstation — velocity, forecast, affinity, cube &amp; fit-aware slotting
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Demo data
        </span>
      </header>

      {loading || !metrics ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Building your distribution centre…
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <ModuleNav active={active} onSelect={setActive} />

          <main className="min-h-0 flex-1 overflow-hidden">
            {active === 'twin' && (
              <TwinPanel
                slots={displaySlots}
                skus={skus}
                colorById={colorById}
                viewMode={viewMode}
                onViewMode={setViewMode}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
              />
            )}

            {active === 'dashboard' && (
              <div className="flex h-full flex-col">
                <ModuleHeader title="Dashboard" subtitle="Slotting health and the size of the prize" />
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                  <IntelligenceSummary recommendations={recommendations} skus={skus} />
                  <KpiPanel metrics={metrics} />
                  <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      What-if optimisation
                    </h3>
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
                </div>
              </div>
            )}

            {active === 'moves' && (
              <div className="flex h-full flex-col">
                <ModuleHeader title="Moves" subtitle="AI move recommendations ranked by payback" />
                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                  <IntelligenceSummary recommendations={recommendations} skus={skus} />
                  <RecommendationsPanel
                    recommendations={recommendations}
                    skus={skus}
                    slots={displaySlots}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={setSelectedSlotId}
                  />
                </div>
              </div>
            )}

            {active === 'items' && (
              <div className="flex h-full flex-col">
                <ModuleHeader title="Items" subtitle={`${skus.length} SKUs · master data`} />
                <div className="border-b border-gray-200 bg-white px-5 py-3">
                  <ImportControls
                    importing={importing}
                    error={importError}
                    onImport={(file) => void importCsv(file)}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <ItemsTable skus={skus} />
                </div>
              </div>
            )}

            {active === 'slots' && (
              <div className="flex h-full flex-col">
                <ModuleHeader title="Slots" subtitle={`${displaySlots.length} locations`} />
                <div className="min-h-0 flex-1">
                  <SlotsTable
                    slots={displaySlots}
                    skus={skus}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={setSelectedSlotId}
                  />
                </div>
              </div>
            )}

            {active === 'reports' && (
              <div className="flex h-full flex-col">
                <ModuleHeader title="Reports" subtitle="Worst-slotted SKUs — biggest travel wins" />
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <WorstSlottedList
                    entries={metrics.worst}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={setSelectedSlotId}
                  />
                </div>
              </div>
            )}

            {active === 'scenarios' && <ComingSoon title="Scenarios" />}
          </main>
        </div>
      )}
    </div>
  );
}
