import type { MoveRecommendation } from '@/slotting/recommendations';
import type { SkuRow, SlotRow } from '@/slotting/types';

function money(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function slotLabel(slot: SlotRow | undefined): string {
  if (!slot) return 'unknown';
  return `A${slot.aisle}-B${slot.bay}-L${slot.level}`;
}

const REASON_LABELS: Record<string, string> = {
  velocity: 'velocity',
  forecast: 'forecast uplift',
  affinity: 'basket affinity',
  replenishment: 'cube/replenishment',
  ergonomics: 'golden zone',
  compatibility: 'fit rules',
};

export function RecommendationsPanel({
  recommendations,
  skus,
  slots,
  selectedSlotId,
  onSelectSlot,
}: {
  recommendations: MoveRecommendation[];
  skus: SkuRow[];
  slots: SlotRow[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}) {
  const skuById = new Map(skus.map((sku) => [sku.id, sku]));
  const slotById = new Map(slots.map((slot) => [slot.id, slot]));

  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No positive-payback AI moves found under current compatibility rules.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recommendations.slice(0, 6).map((rec) => {
        const sku = skuById.get(rec.skuId);
        const isSelected = selectedSlotId === rec.fromSlotId || selectedSlotId === rec.toSlotId;
        return (
          <li key={`${rec.skuId}-${rec.fromSlotId}-${rec.toSlotId}`}>
            <button
              onClick={() => onSelectSlot(rec.fromSlotId)}
              className={`w-full rounded-xl border bg-card px-3 py-3 text-left text-sm transition-colors ${
                isSelected ? 'border-accent bg-accent/10' : 'border-warmborder hover:border-accent/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{sku?.code ?? rec.skuId}</div>
                  <div className="text-xs text-gray-500">
                    {slotLabel(slotById.get(rec.fromSlotId))} → {slotLabel(slotById.get(rec.toSlotId))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-700">{money(rec.annualSavings)}/yr</div>
                  <div className="text-xs text-gray-500">payback {Math.ceil(rec.paybackDays)}d</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {rec.reasonCodes.map((reason) => (
                  <span key={reason} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    {REASON_LABELS[reason] ?? reason}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                confidence {Math.round(rec.confidence * 100)}% · move cost {money(rec.moveCost)}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
