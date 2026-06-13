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
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
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
      <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
        <div className="text-sm font-semibold text-orange-900">
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
          className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
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
