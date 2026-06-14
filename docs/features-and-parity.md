# Features, Roadmap, Parity & Differentiators

> **Parity vs differentiator** — *Parity* = matching what the leading commercial
> suite already does; it's table stakes, not a selling point. A *differentiator*
> is what we do that they don't, or do better — that's the reason to choose us.
> The two sections are kept separate below on purpose.

## Shipped features

**Visualisation**
- Module workstation shell with a left feature nav.
- **3D digital twin** — orbit *and* first-person **walk-through** (WASD, eye
  height), show/hide walls, soft shadows + warm materials.
- **2D overhead** map (dock, aisles/bays, stacked shelf levels) — shares one
  colour source with the 3D scene so they never diverge.
- **Colour modes**: ABC class, pick-density heatmap, forecast heatmap, fit-risk.

**Intelligence**
- **Explainable move recommendations** — ranked by **annual $ payback**, with
  reason codes, confidence, and move cost.
- **What-if simulation** — optimise → before/after metrics → apply or revert.
- **Dashboard KPIs** — slotting health, total pick travel, golden-zone
  compliance, mis-slotted count, with baseline delta chips.

**Rules & AI/ML**
- **Slotting Rules module** — editable hard constraints + soft-weighted
  preferences (sliders + typed inputs); the optimiser is rule-driven and edits
  re-run live.
- **Learned affinities (ML)** — market-basket / association-rule mining
  (support · confidence · **lift**) over the order book *discovers* product
  families; a toggle feeds the learned groups to the optimiser.
- **AI rule assistant** — interviews the SME and drafts a rule set for review
  before applying (human-in-the-loop).

**Operations & data**
- **Orders** module with **pick-path tracing** over the 2D map.
- **Items** and **Slots** master tables.
- **CSV import** — rebuild the DC from your own SKU data.
- **Reports** — worst-slotted SKUs.
- Realistic industrial/safety (Blackwoods-style) demo catalogue; industrial
  zoning (dangerous-goods / bulk / general) with compatibility checks.

**Platform**
- Warm "editorial, ops-tuned" design system (single accent, data-only colour).
- Runs on Fabric, local Docker, or as a static no-backend demo (see
  [architecture-and-hosting.md](architecture-and-hosting.md)).

## Roadmap (upcoming)
- **LLM rule capture (BYO key)** — upgrade the rule assistant from the scripted
  interview to a free-text "describe your DC in plain English" mode powered by
  the Claude API (see the design note at the end). **This is a differentiator.**
- **Demand forecasting (ML)** — replace the static forecast multiplier with a
  time-series model on pick history.
- **Scenarios** — create/compare slotting strategies.
- **Comparison reports** — current vs scenario cost / travel / payback.
- **Storage analysis** — cube utilisation, empty/over-capacity, reclaimable space.
- **Travel networks** — richer routing / order pick-path analytics.
- **Logical view**, **slotting properties** (labour rate, travel speed, weights).
- **3D realism** — pallet/carton goods, in-canvas frosted HUD, Top camera preset.
- **Rayfin persistence** — move demo data into the Rayfin backend.

## Parity matrix (vs the leading commercial suite)
✅ shipped · 🟡 partial · 🟦 planned · ➖ not targeted

| Capability | Leading suite | Us |
|---|---|---|
| 3D digital twin | ✅ | ✅ |
| 2D overhead / heatmap | ✅ | ✅ |
| Velocity/ABC colour coding + legend | ✅ | ✅ |
| Move recommendations | ✅ | ✅ (explainable, $ payback) |
| What-if / scenario simulation | ✅ | 🟡 (what-if ✅, multi-scenario 🟦) |
| Order tracing / pick paths | ✅ | ✅ (2D) |
| Items / Slots master data | ✅ | ✅ |
| Slotting rules engine + UI | ✅ | ✅ |
| Comparison reports (cost/ROI) | ✅ | 🟦 |
| Storage / capacity analysis | ✅ | 🟦 |
| Travel-network modelling | ✅ | 🟡 (visual 🟡, model 🟦) |
| Demand forecasting | ✅ | 🟦 |
| Learned affinities (market-basket ML) | 🟡 | ✅ |
| AI rule capture (interview → rules) | ➖ | ✅ interview · 🟦 LLM free-text |
| WMS integration, validated ROI, services | ✅ | ➖ (not targeted) |

**Honest read:** we have strong parity on *visualisation* and *explainable
recommendation*, partial on *scenarios/rules*, and intentionally do **not** chase
deep WMS integration / professional-services breadth.

## Differentiators (what they don't do, or we do better)
1. **Web-native, zero-install 3D** including a **first-person aisle walk-through**
   in the browser — shareable as a plain URL.
2. **Explainable AI** — every move shows *why* (reason codes) and *how much*
   ($ payback), not a black-box re-optimise.
3. **Fabric-/Rayfin-native option** — fits the Microsoft data stack with a path
   to real-time and shared persistence.
4. **Open & importable** — bring your own SKU CSV; demo anywhere with no infra.
5. **Real AI/ML, not a label** —
   - *Shipped:* an **AI rule assistant** that interviews the SME and generates a
     rule set, and **learned product affinities** mined from real orders
     (market-basket / lift) — turning "AI/ML" from a label into something real.
   - *Future differentiator:* **LLM (Claude) free-text rule capture** — an SME
     describes the DC in plain English and the model emits a validated rule set
     (the commercial suites make you hand-configure every rule).

> Differentiators 1–4 and the shipped parts of 5 are live; the LLM free-text
> rule capture is the next differentiator. The strategy is *not* to out-feature a
> mature suite, but to be the **accessible, explainable, Microsoft-native** twin
> that quantifies the opportunity on your own data.

## Future design note — LLM rule capture (the next differentiator)

Upgrade the AI rule assistant from the scripted interview to an LLM-driven mode.

- **UX:** a "Describe your DC in plain English" textarea (e.g. *"we run chilled
  and hazmat zones, heaviest safe high-lift is 15 kg, fast movers must be at reach
  height, keep the paint kits together"*) → the model returns a proposed
  `RuleSet` → the **existing review/apply step is reused unchanged**.
- **Model:** Claude (`claude-sonnet-4-6` for quality, `claude-haiku-4-5` for
  speed/cost) via the Messages API with a **tool / structured-output schema that
  mirrors the `RuleSet` type** — so the model can only emit values the optimiser
  already runs (the validated, human-in-the-loop pattern from the research).
- **Static-build constraint (we have no backend):** either (a) a **user-pasted
  API key** used directly from the browser — Anthropic allows this via the
  `anthropic-dangerous-direct-browser-access: true` header; document the
  key-exposure caveat (demo only) — or (b) a small **serverless proxy** (Azure
  Function / Cloudflare Worker) holding the key for production. Fall back to the
  scripted interview when no key is present.
- **Where it plugs in:** `src/components/RulesInterview.tsx` gains a second mode;
  a new `src/services/ruleAssistant.ts` does the Claude call and returns a
  `RuleSet`. Nothing else changes — the optimiser, rules model and review step
  are already in place.
