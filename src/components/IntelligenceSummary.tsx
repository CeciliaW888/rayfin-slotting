import type { MoveRecommendation } from '@/slotting/recommendations';
import type { SkuRow } from '@/slotting/types';

export function IntelligenceSummary({
  recommendations,
  skus,
}: {
  recommendations: MoveRecommendation[];
  skus: SkuRow[];
}) {
  const annualSavings = recommendations.reduce((sum, rec) => sum + rec.annualSavings, 0);
  const promoSkus = skus.filter((sku) => (sku.forecastMultiplier ?? 1) > 1.2).length;
  const affinityGroups = new Set(skus.map((sku) => sku.affinityGroup).filter(Boolean)).size;
  const quickWins = recommendations.filter((rec) => rec.paybackDays <= 7).length;

  const cards = [
    { label: 'AI-ranked moves', value: recommendations.length.toString() },
    { label: '≤7 day payback', value: quickWins.toString() },
    { label: 'Opportunity', value: `$${Math.round(annualSavings).toLocaleString()}/yr` },
    { label: 'Signals', value: `${promoSkus} promos · ${affinityGroups} groups` },
  ];

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="text-sm font-semibold text-indigo-950">AI differentiators</div>
      <p className="mt-1 text-xs text-indigo-900/70">
        Goes beyond static slotting by combining forecast uplift, basket affinity,
        replenishment cube, ergonomics and compatibility constraints.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-white/80 px-3 py-2">
            <div className="text-sm font-semibold text-gray-900">{card.value}</div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
