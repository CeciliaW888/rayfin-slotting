# OptiSlot-Style DC Digital Twin Plan

## Decision

Use the **Rayfin backend** as the target backend for the next production-ready iteration. The current demo mode remains useful for visual prototyping, but the OptiSlot-style workstation should be designed around Rayfin entities and services that can support persistent scenarios, orders, rules, move workflows, reports, and richer warehouse master data.

## Evidence from OptiSlot video and screenshots

The FORTNA OptiSlot DC video and screenshots show a full slotting workstation, not just a 3D model.

Visible/claimed capabilities:

- 3D and 2D warehouse digital twin.
- Heat maps of fast and slow moving products.
- Order tracing through the DC.
- Inventory detail display: size, name, and location.
- Multiple slotting layouts and scenarios.
- Operational objectives such as faster fulfilment, productivity increase, and capacity recovery.
- Validation before physical implementation.
- ROI / bottom-line savings reporting.
- Module navigation: Items, Slots, Dashboard, Overhead View, Logical View, Slotting Rules, Zone Slotting, Travel Networks, Orders, Comparison Reports, Moves, Slotting Reports, Storage Analysis, and Slotting Properties.

## Problems in current prototype

1. **3D camera/navigation is not warehouse-like enough**
   - Current view is mostly orbit-based.
   - It does not yet feel like walking inside a DC aisle.
   - Walls can block visibility instead of acting like a removable shell.

2. **Racks and goods are too primitive**
   - Current visual language is still cube-like.
   - OptiSlot shows vivid shelves, racking, goods, labels, and aisle context.
   - We need pallets, cartons, totes, rack beams/uprights, slot labels, floor markings, and operational signs.

3. **Functionality needs to be module-based**
   - Current prototype is a single screen with panels.
   - OptiSlot is a workstation with left navigation and dedicated modules.

## Target product shape

Build a **DC digital twin + slotting workstation** with these layers:

1. **Data layer** — items, slots, orders, rules, zones, travel network, scenarios, moves.
2. **Visual twin layer** — 2D overhead, 3D walkthrough, logical slot hierarchy.
3. **Optimisation layer** — forecast-aware and rule-aware move recommendations.
4. **Workflow layer** — scenario creation, compare, approve/reject moves, export implementation list.
5. **Reporting layer** — comparison reports, cost impact, capacity recovery, rule violations, storage analysis.

## Backend direction: Rayfin

Use Rayfin for the next backend iteration. Required backend capabilities:

- Persist item master data.
- Persist warehouse slots and location hierarchy.
- Persist slotting rules and objective weights.
- Persist order lines and pick history.
- Persist travel-network nodes/edges.
- Persist scenarios and scenario results.
- Persist recommended moves and move status.
- Support comparison-report calculations.
- Support sample/demo data seeding.
- Support API endpoints for the React UI.

Suggested Rayfin-backed entities/resources:

- `Item`
- `Slot`
- `Zone`
- `TravelNode`
- `TravelEdge`
- `Order`
- `OrderLine`
- `SlottingRule`
- `Scenario`
- `ScenarioMetric`
- `MoveRecommendation`
- `StorageAnalysisSnapshot`

## UX modules to build

### 1. Dashboard

Purpose: executive and supervisor summary.

Show:

- Total SKUs.
- Total slots.
- Occupied / empty slots.
- Capacity utilisation.
- Slotting health score.
- Total optimisation opportunity.
- Quick-win moves.
- Estimated annual savings.
- Payback period.
- Top rule violations.

### 2. Items

Purpose: manage SKU/item master.

Fields:

- SKU code.
- Name.
- Category.
- Velocity / picks per day.
- Forecast multiplier.
- Cube.
- Weight.
- Dimensions.
- Affinity group.
- Storage requirements: chilled, hazmat, bulky, each-pick, case-pick, pallet.
- Current location.
- Recommended location.

### 3. Slots

Purpose: manage physical warehouse locations.

Fields:

- Location ID.
- Zone.
- Aisle.
- Bay.
- Level.
- Position.
- Storage type.
- Capacity cube.
- Max weight.
- Current SKU.
- Status: empty, occupied, overfilled, wrong-zone, blocked, reserved.

### 4. Overhead View

Purpose: OptiSlot-style 2D operational map.

Features:

- Floorplan with docks, aisles, staging, zones, and pick paths.
- Colour modes: ABC class, pick heat, forecast heat, fit risk, zone, capacity, replenishment pressure.
- Click location to open detail drawer.
- Toggle labels: location, SKU, pick count, cube %, zone.

### 5. 3D Digital Twin / Walkthrough

Purpose: credible warehouse visualisation.

Features:

- Realistic pallet racking with beams, uprights, shelf levels, and labels.
- Goods as cartons, pallets, totes, drums, wrapped pallets, and bulky goods.
- Aisle-level camera / first-person walkthrough.
- Top-down camera and orbit camera.
- Hide/show walls and roof.
- Select slot/SKU and highlight current/destination locations.
- Draw move path and order pick path.
- Heatmap overlay on rack faces.

### 6. Logical View

Purpose: dense operational hierarchy.

Structure:

```text
Zone → Aisle → Bay → Level → Position
```

Use colour-coded matrices for fast scanning.

### 7. Slotting Rules

Purpose: configure constraints and preferences.

Rules:

- Fast movers in golden zone.
- Heavy items low.
- Chilled only in chilled zone.
- Hazmat only in hazmat zone.
- Bulky items only in bulk locations.
- Cube/weight must fit.
- Affinity products near each other.
- Slow movers can go high/far.
- Promo/forecast uplift items move forward temporarily.

Each rule should support:

- Hard constraint.
- Soft preference.
- Disabled.
- Weight/severity.

### 8. Zone Slotting

Purpose: manage category-to-zone strategy.

Show:

- Zone capacity.
- Current occupancy.
- Demand pressure.
- Violations.
- Recommended zone changes.

### 9. Travel Networks

Purpose: model travel distance and order routes.

Features:

- Dock nodes.
- Aisle nodes.
- Cross-aisle nodes.
- One-way/blocked path support.
- Travel distance calculation.
- Pick-path visualisation.

### 10. Orders

Purpose: support order tracing and pick simulation.

Fields:

- Order ID.
- Order line SKU.
- Quantity.
- Pick location.
- Pick sequence.
- Route distance.
- Pick time.

Features:

- Select order.
- Animate/trace path in 2D and 3D.
- Compare current vs scenario path.

### 11. Scenarios

Purpose: compare multiple slotting strategies.

Example scenarios:

- Current Slotting.
- Travel Optimised.
- Capacity Recovery.
- Promo/Future Demand.
- Low-Move Quick Wins.
- Zone Compliance.

Scenario fields:

- Objective.
- Constraint profile.
- Move limit.
- Expected saving.
- Move count.
- Status: draft, simulated, approved, implemented.

### 12. Moves

Purpose: turn recommendations into operational action.

Fields:

- SKU.
- From location.
- To location.
- Reason codes.
- Priority.
- Expected saving.
- Move cost.
- Payback days.
- Confidence.
- Status: proposed, approved, rejected, exported, completed.

Actions:

- Approve.
- Reject.
- Simulate.
- Export move list.
- Mark completed.

### 13. Comparison Reports

Purpose: recreate OptiSlot-style Comp. Reports.

Inputs:

- Slotting 1: Current Slotting.
- Slotting 2: Scenario 1.
- Use specified pick locations checkbox.
- Report type selector.

Metrics:

- Lines per hour.
- Units per hour.
- Travel time.
- Time to pick.
- Setup and closing time.
- Out-of-stock time.
- Total pick time.
- Total picking cost.
- Total replenishments.
- Replenishment cost.
- Total cost.
- Annualised saving.
- Payback period.
- Move count.
- Capacity recovered.
- Rule violations fixed.

### 14. Slotting Reports

Reports:

- Worst-slotted SKUs.
- Capacity report.
- Velocity report.
- Replenishment report.
- Rule violation report.
- Storage analysis.

### 15. Storage Analysis

Purpose: identify capacity and fit issues.

Show:

- Cube utilisation by zone.
- Empty locations.
- Over-capacity locations.
- Lost capacity.
- Reclaimable capacity.
- Wrong storage-type assignments.

### 16. Slotting Properties

Purpose: configure model assumptions.

Settings:

- Labour rate.
- Travel speed.
- Pick handling time.
- Replenishment cost.
- Move cost.
- Working days per year.
- Dock location.
- Pick method.
- Objective weights.

## Visual implementation plan

### Realistic 3D warehouse

Replace primitive cubes with reusable components:

- `RackRun`
- `RackBay`
- `ShelfLevel`
- `SlotFace`
- `PalletGoods`
- `CartonGoods`
- `ToteGoods`
- `DrumGoods`
- `WrappedPalletGoods`
- `DockDoor`
- `StagingArea`
- `AisleSign`
- `FloorMarking`

### Camera/navigation

Add camera modes:

- `orbit`
- `topDown`
- `aisleWalk`
- `selectedSlotFocus`

Support:

- hide/show walls.
- auto-focus selected slot.
- first-person or guided aisle walkthrough.
- mobile-friendly touch navigation.

## AI differentiators

Go beyond OptiSlot with explainable recommendations:

- Forecast-aware slotting.
- Affinity-aware slotting.
- Low-disruption optimisation.
- Quick-win move set.
- Confidence scoring.
- Human-readable reason codes.
- Supervisor approve/reject workflow.

Example explanation:

```text
Move SKU-014 from A04-B06-L3 to A01-B02-L2.

Reasons:
- Forecast demand +160%.
- Current location is 46m from dock.
- Target is golden-zone level.
- Affinity group is near SKU-018 and SKU-022.
- Estimated annual saving: $4,200.
- Payback: 6 days.
```

## Build sequence

### Sprint 1 — Product shell and visual credibility

- Add OptiSlot-style left navigation.
- Add module routing/state.
- Add 2D overhead view.
- Improve 3D digital twin with realistic racks/goods.
- Add camera modes and hide/show wall control.

### Sprint 2 — Operational modules

- Items.
- Slots.
- Slot detail drawer.
- Slotting Rules.
- Zone Slotting.
- Moves.

### Sprint 3 — Scenarios and reports

- Scenario manager.
- Current vs scenario comparison.
- Comp. Reports page.
- Order pick analysis table.
- ROI/cost metrics.

### Sprint 4 — Order tracing

- Orders module.
- Sample order import/seed.
- Route/path visualisation.
- Before/after route comparison.

### Sprint 5 — Rayfin backend productionisation

- Move seeded/demo data into Rayfin-backed persistence.
- Add API endpoints for all core resources.
- Add migrations/seed scripts.
- Wire React services to Rayfin.
- Keep demo mode as a fallback only.

## MVP acceptance criteria

The next demo should satisfy these checks:

- User can navigate through left-side OptiSlot-style modules.
- 3D view visibly resembles a DC: racks, goods, aisles, docks, signs, floor markings.
- User can walk/focus inside an aisle and hide/show walls.
- 2D overhead view shows zones, aisles, dock, travel network, and heatmap colours.
- User can click a slot and see item size/name/location details.
- User can review move recommendations with reason codes and payback.
- User can compare Current Slotting vs Scenario 1 in a Comp. Reports table.
- User can see an order trace path through the DC.
- Backend direction is Rayfin for persistent scenarios, orders, moves, rules, and reports.
