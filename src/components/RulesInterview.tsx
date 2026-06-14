import { useState } from 'react';

import { INTERVIEW, INTERVIEW_START, summariseRules } from '@/slotting/interview';
import type { RuleSet } from '@/slotting/rules';

export function RulesInterview({
  onApply,
  onCancel,
}: {
  onApply: (r: RuleSet) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RuleSet>(INTERVIEW_START);
  const [transcript, setTranscript] = useState<{ q: string; a: string }[]>([]);

  const done = step >= INTERVIEW.length;
  const current = INTERVIEW[step];

  const choose = (i: number) => {
    const opt = current.options[i];
    setDraft((d) => opt.apply(d));
    setTranscript((t) => [...t, { q: current.prompt, a: opt.label }]);
    setStep((s) => s + 1);
  };

  const restart = () => {
    setStep(0);
    setDraft(INTERVIEW_START);
    setTranscript([]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-5">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-ink2">
        <span className="font-medium text-accent-deep">Slotting assistant.</span> Answer a few questions
        about how your DC runs and I'll draft a slotting rule set for you to review and apply.
      </div>

      {transcript.map((t, i) => (
        <div key={i} className="space-y-1">
          <p className="text-sm text-ink">{t.q}</p>
          <p className="ml-3 inline-block rounded-lg bg-accent/10 px-3 py-1 text-sm font-medium text-accent-deep">
            {t.a}
          </p>
        </div>
      ))}

      {!done ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">{current.prompt}</p>
          <p className="text-xs text-muted">{current.why}</p>
          <div className="flex flex-col gap-2 pt-1">
            {current.options.map((o, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className="rounded-lg border border-warmborder bg-card px-3 py-2 text-left text-sm text-ink transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="pt-1 text-xs text-muted">
            Question {step + 1} of {INTERVIEW.length}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-warmborder bg-card p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Proposed rule set — review before applying
            </h3>
            <ul className="space-y-1">
              {summariseRules(draft).map((line, i) => (
                <li key={i} className="font-mono text-xs text-ink">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onApply(draft)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-deep"
            >
              Apply these rules
            </button>
            <button
              onClick={restart}
              className="rounded-lg border border-warmborder px-3 py-2 text-sm text-ink2 hover:text-ink"
            >
              Start over
            </button>
            <button onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
