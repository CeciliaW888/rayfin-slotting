import { useMemo } from 'react';

import { distanceToDock } from '@/slotting/metrics';
import { GOLDEN_LEVEL } from '@/slotting/types';
import type { SkuRow, SlotRow } from '@/slotting/types';

export function SlotsTable({
  slots,
  skus,
  selectedSlotId,
  onSelectSlot,
}: {
  slots: SlotRow[];
  skus: SkuRow[];
  selectedSlotId: string | null;
  onSelectSlot: (id: string) => void;
}) {
  const skuById = useMemo(() => new Map(skus.map((s) => [s.id, s])), [skus]);
  const rows = useMemo(
    () =>
      [...slots].sort(
        (a, b) => a.aisle - b.aisle || a.bay - b.bay || a.level - b.level
      ),
    [slots]
  );

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
          <tr>
            <th className="px-3 py-2 font-semibold">Location</th>
            <th className="px-3 py-2 font-semibold">Zone</th>
            <th className="px-3 py-2 font-semibold">Storage</th>
            <th className="px-3 py-2 text-right font-semibold">Level</th>
            <th className="px-3 py-2 text-right font-semibold">Cube</th>
            <th className="px-3 py-2 text-right font-semibold">Dist→dock</th>
            <th className="px-3 py-2 font-semibold">Current SKU</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const sku = s.sku_id ? skuById.get(s.sku_id) : undefined;
            const golden = s.level === GOLDEN_LEVEL;
            return (
              <tr
                key={s.id}
                onClick={() => onSelectSlot(s.id)}
                className={`cursor-pointer border-t border-gray-100 ${
                  s.id === selectedSlotId ? 'bg-[#c4825a]/12' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-3 py-1.5 font-mono text-xs text-gray-700">{s.id}</td>
                <td className="px-3 py-1.5 text-gray-500">{s.zone ?? '—'}</td>
                <td className="px-3 py-1.5 text-gray-500">{s.storageType ?? '—'}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                  {s.level}
                  {golden && <span className="ml-1 text-[#b45309]">★</span>}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                  {s.capacityCube ?? '—'}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                  {distanceToDock(s).toFixed(0)}
                </td>
                <td className="px-3 py-1.5 text-gray-700">
                  {sku ? <span className="font-mono text-xs">{sku.code}</span> : '—'}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      sku ? 'bg-[#6f9a6a]/15 text-[#4d7049]' : 'bg-page text-muted'
                    }`}
                  >
                    {sku ? 'occupied' : 'empty'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
