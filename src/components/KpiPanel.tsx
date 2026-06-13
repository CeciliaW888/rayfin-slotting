import type { Metrics } from '@/slotting/metrics';

export function KpiPanel({ metrics }: { metrics: Metrics }) {
  const cards = [
    { label: 'Slotting Health', value: String(metrics.healthScore), suffix: '/100' },
    {
      label: 'Total Pick Travel',
      value: Math.round(metrics.totalTravel).toLocaleString(),
      suffix: '',
    },
    {
      label: 'Golden-Zone Compliance',
      value: String(Math.round(metrics.goldenZoneCompliance * 100)),
      suffix: '%',
    },
    { label: 'Mis-slotted SKUs', value: String(metrics.misslottedCount), suffix: '' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm"
        >
          <div className="text-2xl font-semibold text-gray-900">
            {c.value}
            <span className="text-sm text-gray-400">{c.suffix}</span>
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
