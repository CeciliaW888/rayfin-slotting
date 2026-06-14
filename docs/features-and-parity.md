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
  reason codes, confidence, and move cost (heuristic optimisation, not ML yet).
- **What-if simulation** — optimise → before/after metrics → apply or revert.
- **Dashboard KPIs** — slotting health, total pick travel, golden-zone
  compliance, mis-slotted count, with baseline delta chips.

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
- **Slotting Rules module** — manual rule editor (hard/soft/weighted) **and an
  AI-interviews-the-SME → generates-rules** flow. *(in progress)*
- **Genuine AI/ML** — market-basket **affinity mining** (learn product families
  from the order book) and **demand forecasting** (replace the static forecast
  multiplier). *(in progress)*
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
| Slotting rules engine + UI | ✅ | 🟦 *(in progress)* |
| Comparison reports (cost/ROI) | ✅ | 🟦 |
| Storage / capacity analysis | ✅ | 🟦 |
| Travel-network modelling | ✅ | 🟡 (visual 🟡, model 🟦) |
| Demand forecasting | ✅ | 🟦 |
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
5. **AI knowledge capture (planned)** — an LLM that **interviews a SME and
   generates slotting rules**, plus **learned** product affinities from real
   orders — turning "AI/ML" from a label into something real.

> Differentiators 1–4 are shipped; 5 is the in-progress work. The strategy is
> *not* to out-feature a mature suite, but to be the **accessible, explainable,
> Microsoft-native** twin that quantifies the opportunity on your own data.
