import type { WorstEntry } from '@/slotting/metrics';

export function WorstSlottedList({
  entries,
  selectedSlotId,
  onSelectSlot,
}: {
  entries: WorstEntry[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No mis-slotted SKUs — slotting looks optimal.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {entries.map((entry) => (
        <li key={entry.sku.id}>
          <button
            onClick={() => onSelectSlot(entry.slotId)}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm border transition-colors ${
              selectedSlotId === entry.slotId
                ? 'border-accent bg-accent/10'
                : 'border-warmborder bg-card hover:border-accent/40'
            }`}
          >
            <span className="font-mono font-medium text-ink">{entry.sku.code}</span>
            <span className="text-ink2"> · {entry.sku.name}</span>
            <span className="block text-xs text-[#b3472f]">
              wasting ~{Math.round(entry.wasted).toLocaleString()} travel/day
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
