# Slotting Twin

A digital twin of a single distribution centre used to diagnose and improve product placement (slotting). Built on the local Rayfin stack; presented as a work demo.

## Language

**Distribution Centre (DC)**:
The single, shared warehouse the twin models. There is exactly one, visible to every authenticated user.
_Avoid_: warehouse, facility, site (use DC)

**Slot**:
One addressable storage position in the DC, identified by aisle + bay + level. Holds at most one SKU.
_Avoid_: location, bin, position, cell

**SKU**:
A distinct stockable product that can be placed in a Slot. Carries a pick rate.
_Avoid_: product, item, part, article

**Pick rate**:
How often a SKU is picked, expressed as picks per day. The single driver of how "fast" a SKU is.
_Avoid_: velocity, demand, frequency (use pick rate)

**ABC class**:
A SKU's speed band derived from its pick rate — A (fast), B (medium), C (slow). Derived, never stored.
_Avoid_: category, tier, grade

**Golden zone**:
The easiest-to-reach Slots — prime level (reach height) and close to the dock. Where A-class SKUs belong.
_Avoid_: prime location, hot zone

**Dock**:
The dispatch point all pick travel is measured to. Fixed location at one end of the DC.
_Avoid_: shipping, dispatch door, P&D

**Travel**:
The headline cost metric: for the whole DC, the sum over SKUs of (pick rate × distance from its Slot to the Dock). Lower is better.
_Avoid_: walk distance, picker distance

**Re-slot**:
Moving a SKU from one Slot to another to lower Travel. The core action in later phases.
_Avoid_: rearrange, relocate, move

**Slotting health score**:
A 0–100 roll-up of how good current slotting is, derived from current Travel versus best-achievable Travel.
_Avoid_: rating, grade, efficiency score
