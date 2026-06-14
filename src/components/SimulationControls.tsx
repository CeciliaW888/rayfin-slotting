import type { Metrics } from '@/slotting/metrics';

export function SimulationControls({
  baseline,
  projected,
  isSimulating,
  applying,
  onSimulate,
  onApply,
  onRevert,
}: {
  baseline: Metrics | null;
  projected: Metrics | null;
  isSimulating: boolean;
  applying: boolean;
  onSimulate: () => void;
  onApply: () => void;
  onRevert: () => void;
}) {
  if (!isSimulating) {
    return (
      <button
        onClick={onSimulate}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-deep transition-colors"
      >
        Simulate optimisation
      </button>
    );
  }

  const before = baseline?.totalTravel ?? 0;
  const after = projected?.totalTravel ?? 0;
  const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;

  return (
    <div>
      <div className="rounded-lg bg-accent/8 border border-accent/25 p-3">
        <div className="text-sm font-semibold text-accent-deep">
          Projected after optimisation
        </div>
        <div className="mt-1 text-sm text-gray-700">
          Travel {Math.round(after).toLocaleString()}{' '}
          <span className="font-semibold text-green-700">(−{pct}%)</span>
        </div>
        <div className="text-xs text-gray-500">
          was {Math.round(before).toLocaleString()}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onApply}
          disabled={applying}
          className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50 transition-colors"
        >
          {applying ? 'Applying…' : 'Apply to DC'}
        </button>
        <button
          onClick={onRevert}
          disabled={applying}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Revert
        </button>
      </div>
    </div>
  );
}
