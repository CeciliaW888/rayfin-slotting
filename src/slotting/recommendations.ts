import { distanceToDock } from './metrics';
import { GOLDEN_LEVEL, type SkuRow, type SlotRow } from './types';

export type RecommendationReason =
  | 'velocity'
  | 'forecast'
  | 'affinity'
  | 'replenishment'
  | 'ergonomics'
  | 'compatibility';

export interface RecommendationOptions {
  maxRecommendations?: number;
  labourRatePerHour?: number;
  secondsPerTravelUnit?: number;
  moveMinutes?: number;
  workingDaysPerYear?: number;
}

export interface MoveRecommendation {
  skuId: string;
  targetSkuId: string | null;
  fromSlotId: string;
  toSlotId: string;
  currentTravel: number;
  projectedTravel: number;
  annualSavings: number;
  moveCost: number;
  paybackDays: number;
  confidence: number;
  reasonCodes: RecommendationReason[];
}

const DEFAULT_OPTIONS: Required<RecommendationOptions> = {
  maxRecommendations: 12,
  labourRatePerHour: 42,
  secondsPerTravelUnit: 9,
  moveMinutes: 20,
  workingDaysPerYear: 250,
};

function normalise(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function forecastedPicks(sku: SkuRow): number {
  const multiplier = sku.forecastMultiplier && sku.forecastMultiplier > 0 ? sku.forecastMultiplier : 1;
  return sku.picksPerDay * multiplier;
}

// Dangerous goods (flammables, gases, chemicals) must be segregated; large
// gear belongs in bulk storage. Everything else is general pick stock.
const DANGEROUS_GOODS = new Set(['lubricants', 'spill control', 'welding']);
const BULK_GOODS = new Set(['storage & handling']);

export function requiredZone(category: string): 'dangerous-goods' | 'bulk' | 'general' {
  const c = normalise(category);
  if (DANGEROUS_GOODS.has(c)) return 'dangerous-goods';
  if (BULK_GOODS.has(c)) return 'bulk';
  return 'general';
}

export function isCompatible(sku: SkuRow, slot: SlotRow): boolean {
  const need = requiredZone(sku.category);
  const zone = normalise(slot.zone);

  // The dangerous-goods bay only holds DG stock, and DG stock only goes there.
  if (need === 'dangerous-goods' && zone !== 'dangerous-goods') return false;
  if (zone === 'dangerous-goods' && need !== 'dangerous-goods') return false;
  // Bulky gear belongs in bulk storage.
  if (need === 'bulk' && zone !== 'bulk') return false;

  if (sku.cube && slot.capacityCube && sku.cube > slot.capacityCube) return false;
  if (sku.weight && sku.weight > 20 && slot.level > GOLDEN_LEVEL) return false;
  return true;
}

function slotScore(slot: SlotRow, sku: SkuRow, allSlots: SlotRow[], skuById: Map<string, SkuRow>): number {
  const travelCost = distanceToDock(slot) * forecastedPicks(sku);
  const goldenPenalty = forecastedPicks(sku) >= 50 && slot.level !== GOLDEN_LEVEL ? 30 : 0;
  const heavyPenalty = (sku.weight ?? 0) > 12 && slot.level > GOLDEN_LEVEL ? 80 : 0;
  const cube = sku.cube ?? 1;
  const replenishmentPenalty = slot.capacityCube ? (cube * forecastedPicks(sku)) / slot.capacityCube : 0;

  let affinityBonus = 0;
  if (sku.affinityGroup) {
    for (const neighbor of allSlots) {
      if (!neighbor.sku_id || neighbor.id === slot.id) continue;
      const other = skuById.get(neighbor.sku_id);
      if (!other || other.affinityGroup !== sku.affinityGroup) continue;
      const distance = Math.abs(neighbor.aisle - slot.aisle) + Math.abs(neighbor.bay - slot.bay);
      if (distance <= 1) affinityBonus += 20;
      else if (distance <= 3) affinityBonus += 8;
    }
  }

  return travelCost + goldenPenalty + heavyPenalty + replenishmentPenalty - affinityBonus;
}

function uniqueReasons(sku: SkuRow, from: SlotRow, to: SlotRow): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];
  if (forecastedPicks(sku) >= 50 && distanceToDock(to) < distanceToDock(from)) reasons.push('velocity');
  if ((sku.forecastMultiplier ?? 1) > 1.2) reasons.push('forecast');
  if (sku.affinityGroup) reasons.push('affinity');
  if ((sku.cube ?? 0) > 1 || to.capacityCube) reasons.push('replenishment');
  if (to.level === GOLDEN_LEVEL && from.level !== GOLDEN_LEVEL) reasons.push('ergonomics');
  reasons.push('compatibility');
  return [...new Set(reasons)];
}

/**
 * AI-inspired dynamic slotting recommender. It uses the same observable inputs
 * described in the Lucas/OptiSlot research videos — velocity, forecast uplift,
 * SKU-slot compatibility, cube/replenishment pressure, affinity and ergonomics —
 * to rank small opportunistic swaps by estimated payback.
 */
export function recommendMoves(
  slots: SlotRow[],
  skus: SkuRow[],
  options: RecommendationOptions = {}
): MoveRecommendation[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const skuById = new Map(skus.map((s) => [s.id, s]));
  const occupied = slots.filter((slot) => slot.sku_id && skuById.has(slot.sku_id));
  const recommendations: MoveRecommendation[] = [];

  for (const from of occupied) {
    const sku = skuById.get(from.sku_id!);
    if (!sku) continue;
    for (const to of occupied) {
      if (to.id === from.id) continue;
      const targetSku = to.sku_id ? skuById.get(to.sku_id) : undefined;
      if (!isCompatible(sku, to)) continue;
      if (targetSku && !isCompatible(targetSku, from)) continue;

      const before =
        slotScore(from, sku, slots, skuById) + (targetSku ? slotScore(to, targetSku, slots, skuById) : 0);
      const after =
        slotScore(to, sku, slots, skuById) + (targetSku ? slotScore(from, targetSku, slots, skuById) : 0);
      const improvement = before - after;
      if (improvement <= 0) continue;

      const annualSavings =
        (improvement * opts.secondsPerTravelUnit * opts.workingDaysPerYear * opts.labourRatePerHour) / 3600;
      const moveCost = (opts.moveMinutes / 60) * opts.labourRatePerHour * (targetSku ? 2 : 1);
      const paybackDays = annualSavings > 0 ? (moveCost / annualSavings) * opts.workingDaysPerYear : Infinity;

      recommendations.push({
        skuId: sku.id,
        targetSkuId: targetSku?.id ?? null,
        fromSlotId: from.id,
        toSlotId: to.id,
        currentTravel: before,
        projectedTravel: after,
        annualSavings,
        moveCost,
        paybackDays,
        confidence: Math.max(0.55, Math.min(0.95, improvement / Math.max(before, 1))),
        reasonCodes: uniqueReasons(sku, from, to),
      });
    }
  }

  // A↔B and B↔A describe the same physical swap, so keep one per unordered
  // slot pair — the more explanatory framing (more reason codes).
  const byPair = new Map<string, MoveRecommendation>();
  for (const rec of recommendations) {
    const key = [rec.fromSlotId, rec.toSlotId].sort().join('|');
    const kept = byPair.get(key);
    if (!kept || rec.reasonCodes.length > kept.reasonCodes.length) byPair.set(key, rec);
  }

  return [...byPair.values()]
    .sort((a, b) => a.paybackDays - b.paybackDays || b.annualSavings - a.annualSavings)
    .slice(0, opts.maxRecommendations);
}
