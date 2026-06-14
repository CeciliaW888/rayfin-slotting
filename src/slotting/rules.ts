/**
 * The slotting rule set. Mirrors the three-tier model commercial slotting tools
 * use: HARD constraints prune feasible locations (validated in `isCompatible`),
 * SOFT preferences are weighted objective terms (summed in `slotScore`). Every
 * value here was previously a magic number hard-coded in recommendations.ts;
 * the Rules module edits this object live and the optimiser re-runs.
 */
export interface RuleSet {
  /** Hard: dangerous goods / bulk only in their zones (and vice-versa). */
  zoneSegregation: boolean;
  /** Hard: a SKU's cube must fit the slot's capacity. */
  cubeFit: boolean;
  /** Hard: items over the weight limit can't go above the golden level. */
  weightErgonomics: boolean;
  weightLimit: number;

  /** Soft: fast movers belong at the golden (reach) level. */
  goldenZone: { enabled: boolean; weight: number; fastThreshold: number };
  /** Soft: heavy items penalised when stored high. */
  heavy: { enabled: boolean; weight: number; threshold: number };
  /** Soft: keep affinity-group items near each other. */
  affinity: { enabled: boolean; nearBonus: number; farBonus: number };
  /** Soft: avoid replenishment pressure (high throughput vs small slot). */
  replenishment: { enabled: boolean; weight: number };
}

export const DEFAULT_RULES: RuleSet = {
  zoneSegregation: true,
  cubeFit: true,
  weightErgonomics: true,
  weightLimit: 20,
  goldenZone: { enabled: true, weight: 30, fastThreshold: 50 },
  heavy: { enabled: true, weight: 80, threshold: 12 },
  affinity: { enabled: true, nearBonus: 20, farBonus: 8 },
  replenishment: { enabled: true, weight: 1 },
};
