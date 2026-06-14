import { DEFAULT_RULES, type RuleSet } from './rules';

/**
 * A guided rule-capture interview. Each answer maps to a patch on the RuleSet,
 * so the "AI" only ever produces values the optimiser already understands —
 * exactly the hybrid pattern the research recommends (the assistant elicits
 * intent; a deterministic system validates and enforces). This runs fully
 * client-side; an optional LLM mode can replace the scripted questions later.
 */
export interface InterviewOption {
  label: string;
  apply: (r: RuleSet) => RuleSet;
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  why: string;
  options: InterviewOption[];
}

export const INTERVIEW_START: RuleSet = DEFAULT_RULES;

export const INTERVIEW: InterviewQuestion[] = [
  {
    id: 'dg',
    prompt: 'Do you store dangerous goods, chemicals or flammables that must be kept in a segregated area?',
    why: 'Hard constraint — zone segregation.',
    options: [
      { label: 'Yes — keep them segregated', apply: (r) => ({ ...r, zoneSegregation: true }) },
      { label: 'No', apply: (r) => ({ ...r, zoneSegregation: false }) },
    ],
  },
  {
    id: 'weight',
    prompt: 'What is the heaviest item a picker should be lifting above reach height?',
    why: 'Hard constraint — weight ergonomics limit.',
    options: [
      { label: '10 kg', apply: (r) => ({ ...r, weightErgonomics: true, weightLimit: 10 }) },
      { label: '15 kg', apply: (r) => ({ ...r, weightErgonomics: true, weightLimit: 15 }) },
      { label: '20 kg', apply: (r) => ({ ...r, weightErgonomics: true, weightLimit: 20 }) },
      { label: 'No limit', apply: (r) => ({ ...r, weightErgonomics: false }) },
    ],
  },
  {
    id: 'golden',
    prompt: 'How strongly should fast-moving items be placed at easy reach height (the golden zone)?',
    why: 'Soft preference — golden-zone weight.',
    options: [
      { label: 'Critical', apply: (r) => ({ ...r, goldenZone: { ...r.goldenZone, enabled: true, weight: 70 } }) },
      { label: 'Somewhat', apply: (r) => ({ ...r, goldenZone: { ...r.goldenZone, enabled: true, weight: 30 } }) },
      { label: 'Not important', apply: (r) => ({ ...r, goldenZone: { ...r.goldenZone, enabled: false } }) },
    ],
  },
  {
    id: 'affinity',
    prompt: 'Should items that are frequently ordered together be kept close to each other?',
    why: 'Soft preference — affinity grouping (optionally learned from orders).',
    options: [
      {
        label: 'Yes — and learn the families from my orders',
        apply: (r) => ({ ...r, affinity: { ...r.affinity, enabled: true }, useLearnedAffinity: true }),
      },
      {
        label: 'Yes — use the families I already maintain',
        apply: (r) => ({ ...r, affinity: { ...r.affinity, enabled: true }, useLearnedAffinity: false }),
      },
      { label: 'No', apply: (r) => ({ ...r, affinity: { ...r.affinity, enabled: false } }) },
    ],
  },
  {
    id: 'heavy',
    prompt: 'Is storing heavy items high on the racking a safety concern the optimiser should avoid?',
    why: 'Soft preference — heavy items low.',
    options: [
      { label: 'Yes', apply: (r) => ({ ...r, heavy: { ...r.heavy, enabled: true, weight: 80 } }) },
      { label: 'No', apply: (r) => ({ ...r, heavy: { ...r.heavy, enabled: false } }) },
    ],
  },
  {
    id: 'replen',
    prompt: 'Do pick faces sometimes run out mid-shift, so high-throughput items need bigger slots?',
    why: 'Soft preference — replenishment pressure.',
    options: [
      { label: 'Yes, often', apply: (r) => ({ ...r, replenishment: { ...r.replenishment, enabled: true, weight: 2 } }) },
      { label: 'Sometimes', apply: (r) => ({ ...r, replenishment: { ...r.replenishment, enabled: true, weight: 1 } }) },
      { label: 'No', apply: (r) => ({ ...r, replenishment: { ...r.replenishment, enabled: false } }) },
    ],
  },
];

/** A human-readable summary of a captured rule set, for the review step. */
export function summariseRules(r: RuleSet): string[] {
  return [
    `Zone segregation: ${r.zoneSegregation ? 'enforced' : 'off'}`,
    `Weight ergonomics: ${r.weightErgonomics ? `items over ${r.weightLimit}kg kept low` : 'off'}`,
    `Golden zone: ${r.goldenZone.enabled ? `on (weight ${r.goldenZone.weight})` : 'off'}`,
    `Affinity: ${r.affinity.enabled ? (r.useLearnedAffinity ? 'on — learned from orders' : 'on — maintained families') : 'off'}`,
    `Heavy items low: ${r.heavy.enabled ? `on (weight ${r.heavy.weight})` : 'off'}`,
    `Replenishment: ${r.replenishment.enabled ? `on (weight ${r.replenishment.weight})` : 'off'}`,
  ];
}
