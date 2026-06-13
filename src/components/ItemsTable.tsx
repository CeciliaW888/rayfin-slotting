import { useMemo } from 'react';

import { ABC_COLOR } from '@/slotting/colors';
import { classifyAbc } from '@/slotting/metrics';
import { forecastedPicks } from '@/slotting/recommendations';
import type { SkuRow } from '@/slotting/types';

export function ItemsTable({ skus }: { skus: SkuRow[] }) {
  const abc = useMemo(() => classifyAbc(skus), [skus]);
  const rows = useMemo(() => [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay), [skus]);

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
          <tr>
            <th className="px-3 py-2 font-semibold">SKU</th>
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">Category</th>
            <th className="px-3 py-2 font-semibold">ABC</th>
            <th className="px-3 py-2 text-right font-semibold">Picks/day</th>
            <th className="px-3 py-2 text-right font-semibold">Forecast</th>
            <th className="px-3 py-2 text-right font-semibold">Cube</th>
            <th className="px-3 py-2 text-right font-semibold">Weight</th>
            <th className="px-3 py-2 font-semibold">Affinity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const cls = abc.get(s.id);
            const uplift = (s.forecastMultiplier ?? 1) > 1;
            return (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-1.5 font-mono text-xs text-gray-700">{s.code}</td>
                <td className="px-3 py-1.5 text-gray-700">{s.name}</td>
                <td className="px-3 py-1.5 text-gray-500">{s.category}</td>
                <td className="px-3 py-1.5">
                  {cls && (
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: ABC_COLOR[cls] }}
                    >
                      {cls}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">{s.picksPerDay}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  <span className={uplift ? 'font-semibold text-[#b45309]' : 'text-gray-400'}>
                    {Math.round(forecastedPicks(s))}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">{s.cube ?? '—'}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">{s.weight ?? '—'}</td>
                <td className="px-3 py-1.5 text-gray-500">{s.affinityGroup ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
