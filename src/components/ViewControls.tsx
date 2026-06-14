import { ABC_COLOR, heatColor, type ViewMode } from '@/slotting/colors';

const MODES: { id: ViewMode; label: string }[] = [
  { id: 'abc', label: 'ABC class' },
  { id: 'heat', label: 'Pick heatmap' },
  { id: 'forecast', label: 'Forecast heatmap' },
  { id: 'compatibility', label: 'Fit risk' },
];

export function ViewControls({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div>
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === m.id
                ? 'bg-accent/15 text-accent-deep'
                : 'text-ink2 hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {mode === 'abc' ? <AbcLegend /> : mode === 'compatibility' ? <CompatibilityLegend /> : <HeatLegend forecast={mode === 'forecast'} />}
      </div>
    </div>
  );
}

function AbcLegend() {
  const items: { cls: keyof typeof ABC_COLOR; label: string }[] = [
    { cls: 'A', label: 'A · fast' },
    { cls: 'B', label: 'B · medium' },
    { cls: 'C', label: 'C · slow' },
  ];
  return (
    <div className="flex gap-3 text-xs text-gray-500">
      {items.map((it) => (
        <span key={it.cls} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: ABC_COLOR[it.cls] }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function HeatLegend({ forecast = false }: { forecast?: boolean }) {
  const gradient = `linear-gradient(to right, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})`;
  return (
    <div className="text-xs text-gray-500">
      <div className="h-3 w-full rounded-sm" style={{ background: gradient }} />
      <div className="mt-1 flex justify-between">
        <span>{forecast ? 'low forecast' : 'few picks'}</span>
        <span>{forecast ? 'high forecast' : 'many picks'}</span>
      </div>
    </div>
  );
}

function CompatibilityLegend() {
  return (
    <div className="flex gap-3 text-xs text-gray-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-[#6f9a6a]" /> fits rules
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-[#b3472f]" /> needs review
      </span>
    </div>
  );
}
