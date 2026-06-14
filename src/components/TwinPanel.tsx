import { useState } from 'react';

import { ViewControls } from '@/components/ViewControls';
import { OverheadView } from '@/scene/OverheadView';
import { WarehouseScene, type CameraMode } from '@/scene/WarehouseScene';
import type { ViewMode } from '@/slotting/colors';
import type { SkuRow, SlotRow } from '@/slotting/types';

type Dimension = '3d' | '2d';

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.id ? 'bg-accent/15 text-accent-deep' : 'text-ink2 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TwinPanel({
  slots,
  skus,
  colorById,
  viewMode,
  onViewMode,
  selectedSlotId,
  onSelectSlot,
}: {
  slots: SlotRow[];
  skus: SkuRow[];
  colorById: Map<string, string>;
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
  selectedSlotId: string | null;
  onSelectSlot: (id: string) => void;
}) {
  const [dimension, setDimension] = useState<Dimension>('3d');
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [showWalls, setShowWalls] = useState(false);

  const selected = slots.find((s) => s.id === selectedSlotId);
  const selectedSku = selected?.sku_id ? skus.find((s) => s.id === selected.sku_id) : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-white px-4 py-2.5">
        <Segmented<Dimension>
          options={[
            { id: '3d', label: '3D Twin' },
            { id: '2d', label: '2D Overhead' },
          ]}
          value={dimension}
          onChange={setDimension}
        />

        {dimension === '3d' && (
          <>
            <Segmented<CameraMode>
              options={[
                { id: 'orbit', label: 'Orbit' },
                { id: 'walk', label: 'Walk' },
              ]}
              value={cameraMode}
              onChange={setCameraMode}
            />
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showWalls}
                onChange={(e) => setShowWalls(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#c4825a]"
              />
              Walls
            </label>
          </>
        )}

        <div className="ml-auto">
          <ViewControls mode={viewMode} onChange={onViewMode} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {dimension === '3d' ? (
          <WarehouseScene
            slots={slots}
            colorById={colorById}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            cameraMode={cameraMode}
            showWalls={showWalls}
          />
        ) : (
          <OverheadView
            slots={slots}
            colorById={colorById}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
          />
        )}

        {dimension === '3d' && cameraMode === 'walk' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <p className="rounded-full bg-gray-900/80 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
              Click to walk · W A S D / arrows to move · mouse to look · Esc to exit
            </p>
          </div>
        )}

        {selected && (
          <div className="absolute left-4 top-4 w-56 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-gray-700">{selected.id}</span>
              <button
                onClick={() => onSelectSlot('')}
                className="text-xs text-gray-400 hover:text-gray-600"
                aria-label="Clear selection"
              >
                ✕
              </button>
            </div>
            <dl className="mt-2 space-y-1 text-xs">
              <Row label="Zone" value={selected.zone ?? '—'} />
              <Row label="Storage" value={selected.storageType ?? '—'} />
              <Row label="Level" value={String(selected.level)} />
              <Row label="Capacity" value={selected.capacityCube ? `${selected.capacityCube} cube` : '—'} />
              <div className="my-1.5 border-t border-gray-100" />
              {selectedSku ? (
                <>
                  <Row label="SKU" value={selectedSku.code} />
                  <Row label="Name" value={selectedSku.name} />
                  <Row label="Picks/day" value={String(selectedSku.picksPerDay)} />
                  <Row label="Category" value={selectedSku.category} />
                </>
              ) : (
                <p className="text-gray-400">Empty location</p>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-400">{label}</dt>
      <dd className="truncate font-medium text-gray-700">{value}</dd>
    </div>
  );
}
