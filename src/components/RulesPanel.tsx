import { DEFAULT_RULES, type RuleSet } from '@/slotting/rules';

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink2">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-warmborder'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-4' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-1.5 ${disabled ? 'opacity-40' : ''}`}>
      <span className="w-40 shrink-0 text-xs text-ink2">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[#c4825a]"
      />
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-ink">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-warmborder bg-card p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="divide-y divide-warmborder">{children}</div>
    </section>
  );
}

export function RulesPanel({ rules, onChange }: { rules: RuleSet; onChange: (r: RuleSet) => void }) {
  const set = (patch: Partial<RuleSet>) => onChange({ ...rules, ...patch });

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs text-ink2">
          Hard constraints prune infeasible locations; soft preferences are weighted objectives the
          optimiser balances. Edits re-run the recommender live — check the Dashboard and Twin.
        </p>
        <button
          onClick={() => onChange(DEFAULT_RULES)}
          className="shrink-0 rounded-lg border border-warmborder px-3 py-1.5 text-xs font-medium text-ink2 hover:border-accent/40 hover:text-ink"
        >
          Reset to defaults
        </button>
      </div>

      <Section title="Hard constraints — must hold">
        <Toggle
          label="Zone segregation"
          hint="Dangerous goods and bulk stock confined to their zones."
          on={rules.zoneSegregation}
          onChange={(v) => set({ zoneSegregation: v })}
        />
        <Toggle
          label="Cube fit"
          hint="A SKU's cube must not exceed the slot's capacity."
          on={rules.cubeFit}
          onChange={(v) => set({ cubeFit: v })}
        />
        <Toggle
          label="Weight ergonomics"
          hint={`Items over ${rules.weightLimit}kg can't be stored above the golden level.`}
          on={rules.weightErgonomics}
          onChange={(v) => set({ weightErgonomics: v })}
        />
        <Slider
          label="Weight limit (kg)"
          value={rules.weightLimit}
          min={5}
          max={40}
          onChange={(v) => set({ weightLimit: v })}
          disabled={!rules.weightErgonomics}
        />
      </Section>

      <Section title="Soft preferences — weighted objectives">
        <Toggle
          label="Golden zone for fast movers"
          hint="Push high-velocity SKUs to reach height (level 2)."
          on={rules.goldenZone.enabled}
          onChange={(v) => set({ goldenZone: { ...rules.goldenZone, enabled: v } })}
        />
        <Slider
          label="Golden-zone weight"
          value={rules.goldenZone.weight}
          min={0}
          max={100}
          onChange={(v) => set({ goldenZone: { ...rules.goldenZone, weight: v } })}
          disabled={!rules.goldenZone.enabled}
        />
        <Slider
          label="Fast-mover threshold"
          value={rules.goldenZone.fastThreshold}
          min={10}
          max={150}
          step={5}
          onChange={(v) => set({ goldenZone: { ...rules.goldenZone, fastThreshold: v } })}
          disabled={!rules.goldenZone.enabled}
        />

        <Toggle
          label="Heavy items low"
          hint="Penalise heavy SKUs stored above the golden level."
          on={rules.heavy.enabled}
          onChange={(v) => set({ heavy: { ...rules.heavy, enabled: v } })}
        />
        <Slider
          label="Heavy penalty weight"
          value={rules.heavy.weight}
          min={0}
          max={150}
          step={5}
          onChange={(v) => set({ heavy: { ...rules.heavy, weight: v } })}
          disabled={!rules.heavy.enabled}
        />

        <Toggle
          label="Affinity grouping"
          hint="Keep items in the same kit/family near each other."
          on={rules.affinity.enabled}
          onChange={(v) => set({ affinity: { ...rules.affinity, enabled: v } })}
        />
        <Slider
          label="Adjacent bonus"
          value={rules.affinity.nearBonus}
          min={0}
          max={60}
          onChange={(v) => set({ affinity: { ...rules.affinity, nearBonus: v } })}
          disabled={!rules.affinity.enabled}
        />

        <Toggle
          label="Replenishment pressure"
          hint="Avoid putting high-throughput SKUs in small slots."
          on={rules.replenishment.enabled}
          onChange={(v) => set({ replenishment: { ...rules.replenishment, enabled: v } })}
        />
        <Slider
          label="Replenishment weight"
          value={rules.replenishment.weight}
          min={0}
          max={5}
          step={0.5}
          onChange={(v) => set({ replenishment: { ...rules.replenishment, weight: v } })}
          disabled={!rules.replenishment.enabled}
        />
      </Section>
    </div>
  );
}
