import type { Metrics } from '@/slotting/metrics';

interface Card {
  label: string;
  value: string;
  suffix: string;
  now: number;
  base: number;
  betterWhenUp: boolean;
}

function DeltaChip({ now, base, betterWhenUp }: Pick<Card, 'now' | 'base' | 'betterWhenUp'>) {
  const diff = Math.round(now - base);
  if (diff === 0) return null;
  const improved = betterWhenUp ? diff > 0 : diff < 0;
  const sign = diff > 0 ? '+' : '−';
  return (
    <span
      className={`ml-2 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums ${
        improved ? 'bg-[#6f9a6a]/15 text-[#4d7049]' : 'bg-[#b3472f]/12 text-[#b3472f]'
      }`}
    >
      {sign}
      {Math.abs(diff).toLocaleString()}
    </span>
  );
}

export function KpiPanel({ metrics, baseline }: { metrics: Metrics; baseline?: Metrics | null }) {
  const b = baseline ?? metrics;
  const cards: Card[] = [
    { label: 'Slotting Health', value: String(metrics.healthScore), suffix: '/100', now: metrics.healthScore, base: b.healthScore, betterWhenUp: true },
    {
      label: 'Total Pick Travel',
      value: Math.round(metrics.totalTravel).toLocaleString(),
      suffix: ' m/day',
      now: metrics.totalTravel,
      base: b.totalTravel,
      betterWhenUp: false,
    },
    {
      label: 'Golden-Zone Compliance',
      value: String(Math.round(metrics.goldenZoneCompliance * 100)),
      suffix: '%',
      now: metrics.goldenZoneCompliance,
      base: b.goldenZoneCompliance,
      betterWhenUp: true,
    },
    { label: 'Mis-slotted SKUs', value: String(metrics.misslottedCount), suffix: '', now: metrics.misslottedCount, base: b.misslottedCount, betterWhenUp: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-warmborder bg-card px-4 py-3">
          <div className="flex items-baseline">
            <span className="font-display text-2xl font-semibold text-ink tabular-nums">
              {c.value}
              <span className="text-sm text-muted">{c.suffix}</span>
            </span>
            {baseline && <DeltaChip now={c.now} base={c.base} betterWhenUp={c.betterWhenUp} />}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
