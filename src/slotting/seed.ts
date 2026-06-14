import type { SkuRow, SlotRow } from './types';

const AISLES = 4;
const BAYS = 6;
const LEVELS = 3;

export type SkuSpec = Omit<SkuRow, 'id'>;
export type SlotSpec = Omit<SlotRow, 'id' | 'sku_id'>;

export interface DcSeed {
  skus: SkuSpec[];
  slots: SlotSpec[];
  /** Per-slot SKU code (or null for an empty slot), aligned to `slots` by index. */
  assignments: (string | null)[];
}

/** The physical DC: aisles × bays × levels. bay = depth from dock, aisle = lateral. */
export function generateSlotGrid(): SlotSpec[] {
  const slots: SlotSpec[] = [];
  for (let aisle = 1; aisle <= AISLES; aisle++) {
    for (let bay = 1; bay <= BAYS; bay++) {
      for (let level = 1; level <= LEVELS; level++) {
        // Industrial DC zoning: a dangerous-goods aisle, a bulk-storage aisle,
        // and general pick faces in between.
        const zone = aisle === 1 ? 'dangerous-goods' : aisle === 4 ? 'bulk' : 'general';
        const storageType = bay >= 5 || zone === 'bulk' ? 'bulk' : 'each-pick';
        slots.push({
          aisle,
          bay,
          level,
          x: bay * 2,
          y: aisle * 3,
          zone,
          storageType,
          capacityCube: storageType === 'bulk' ? 180 : 60,
        });
      }
    }
  }
  return slots;
}

export const SLOT_COUNT = AISLES * BAYS * LEVELS;

/**
 * Real-world demo catalogue modelled on Blackwoods (Australian industrial &
 * safety / MRO distributor): high-consumption PPE consumables as the fast
 * movers, a long tail of tools, fasteners, and bulky storage gear. Categories
 * drive zoning (see `requiredZone` in recommendations.ts); pick rates follow a
 * realistic Pareto curve.
 */
const DEMO_SKUS: SkuSpec[] = [
  { code: '03004412', name: 'Force360 Nitrile Disposable Gloves Box 100', category: 'PPE', picksPerDay: 248, cube: 3, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03002180', name: 'ProChoice Corded Earplugs Box 100', category: 'PPE', picksPerDay: 212, cube: 2, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03003177', name: '3M 9320A+ P2 Disposable Respirator', category: 'PPE', picksPerDay: 196, cube: 4, weight: 1, forecastMultiplier: 1.6, affinityGroup: 'ppe-kit' },
  { code: '03005540', name: 'ProChoice Clear Anti-Fog Safety Glasses', category: 'PPE', picksPerDay: 168, cube: 2, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03021031', name: 'Cabac Black Cable Ties 200mm Pk100', category: 'Electrical', picksPerDay: 150, cube: 2, weight: 1 },
  { code: '03011220', name: 'Bisley Hi-Vis Drill Shirt Orange', category: 'Workwear', picksPerDay: 122, cube: 6, weight: 1, forecastMultiplier: 1.8, affinityGroup: 'site-setup' },
  { code: '03031455', name: 'Norton Cutting Disc 125mm Pk25', category: 'Abrasives', picksPerDay: 108, cube: 3, weight: 2 },
  { code: '03004419', name: 'Force360 Cut-Resistant Glove Level 5', category: 'PPE', picksPerDay: 96, cube: 2, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03061204', name: 'WD-40 Multi-Use Lubricant 300g', category: 'Lubricants', picksPerDay: 90, cube: 3, weight: 1 },
  { code: '03005512', name: 'ProChoice Vented Hard Hat White', category: 'PPE', picksPerDay: 84, cube: 8, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03011240', name: 'Bisley Hi-Vis Cargo Pant Navy', category: 'Workwear', picksPerDay: 77, cube: 6, weight: 1, affinityGroup: 'site-setup' },
  { code: '03041008', name: 'Stanley PowerLock Tape Measure 8m', category: 'Hand Tools', picksPerDay: 70, cube: 3, weight: 1 },
  { code: '03061310', name: 'Loctite 243 Threadlocker 50ml', category: 'Lubricants', picksPerDay: 64, cube: 1, weight: 1, affinityGroup: 'fastening' },
  { code: '03071150', name: 'Sika MultiSeal Cloth Tape 48mm Silver', category: 'Tapes & Adhesives', picksPerDay: 58, cube: 3, weight: 1 },
  { code: '03004450', name: 'Ansell AlphaTec Chemical Glove', category: 'PPE', picksPerDay: 53, cube: 2, weight: 1, affinityGroup: 'ppe-kit' },
  { code: '03021090', name: 'Cabac Insulated Screwdriver Set 7pc', category: 'Electrical', picksPerDay: 49, cube: 3, weight: 1 },
  { code: '03041122', name: 'Sidchrome Combination Spanner Set', category: 'Hand Tools', picksPerDay: 45, cube: 5, weight: 3 },
  { code: '03031470', name: 'Norton Flap Disc 125mm 40-Grit', category: 'Abrasives', picksPerDay: 42, cube: 2, weight: 1 },
  { code: '03051201', name: 'ProChoice Welding Gauntlet Leather', category: 'Welding', picksPerDay: 39, cube: 3, weight: 1, affinityGroup: 'welding-kit' },
  { code: '03051310', name: 'BOC Welding Electrodes 2.5mm 5kg', category: 'Welding', picksPerDay: 36, cube: 6, weight: 5, affinityGroup: 'welding-kit' },
  { code: '03011280', name: 'Blundstone 312 Safety Boot', category: 'Workwear', picksPerDay: 33, cube: 8, weight: 2 },
  { code: '03051330', name: '3M Speedglas 9100 Welding Helmet', category: 'Welding', picksPerDay: 29, cube: 12, weight: 2, affinityGroup: 'welding-kit' },
  { code: '03062010', name: 'Spill Crew Oil Absorbent Pads Pk100', category: 'Spill Control', picksPerDay: 27, cube: 10, weight: 3, affinityGroup: 'spill-kit' },
  { code: '03042210', name: 'Makita 18V Cordless Drill Driver', category: 'Power Tools', picksPerDay: 24, cube: 9, weight: 2 },
  { code: '03021130', name: 'Cabac Heat Shrink Tube Assortment', category: 'Electrical', picksPerDay: 22, cube: 3, weight: 1 },
  { code: '03081005', name: 'St John Workplace First Aid Kit', category: 'First Aid', picksPerDay: 20, cube: 7, weight: 2, forecastMultiplier: 1.4 },
  { code: '03091020', name: "Brady 'Hard Hat Area' Safety Sign", category: 'Safety Signage', picksPerDay: 18, cube: 4, weight: 1, affinityGroup: 'site-setup' },
  { code: '03012150', name: 'Zinc Galv Hex Bolt M10x50 Box 50', category: 'Fasteners', picksPerDay: 17, cube: 2, weight: 3, affinityGroup: 'fastening' },
  { code: '03012230', name: 'Ramset DynaBolt M12 Box 25', category: 'Fasteners', picksPerDay: 15, cube: 3, weight: 4, affinityGroup: 'fastening' },
  { code: '03071210', name: 'Selleys 401 Multi-Grip Adhesive 320ml', category: 'Tapes & Adhesives', picksPerDay: 14, cube: 2, weight: 1 },
  { code: '03015110', name: 'Karcher Degreaser Concentrate 5L', category: 'Cleaning & Hygiene', picksPerDay: 13, cube: 6, weight: 5 },
  { code: '03042260', name: 'Milwaukee M18 Angle Grinder 125mm', category: 'Power Tools', picksPerDay: 12, cube: 8, weight: 3 },
  { code: '03062080', name: 'Spill Crew General Spill Kit 120L', category: 'Spill Control', picksPerDay: 11, cube: 38, weight: 12, affinityGroup: 'spill-kit' },
  { code: '03071250', name: 'Sika Boom Expanding Foam 750ml', category: 'Tapes & Adhesives', picksPerDay: 10, cube: 4, weight: 1 },
  { code: '03005580', name: 'ProChoice Disposable Coverall Type 5/6', category: 'PPE', picksPerDay: 9, cube: 3, weight: 1 },
  { code: '03013310', name: 'Storeman Pallet Rack Beam 2.7m', category: 'Storage & Handling', picksPerDay: 8, cube: 70, weight: 18 },
  { code: '03013420', name: 'Sealey 3-Tier Workshop Trolley', category: 'Storage & Handling', picksPerDay: 7, cube: 55, weight: 14 },
  { code: '03021200', name: 'Brady Lockout/Tagout Station Kit', category: 'Electrical', picksPerDay: 7, cube: 6, weight: 2 },
  { code: '03013480', name: 'Bullivants Round Lifting Sling 2T 3m', category: 'Storage & Handling', picksPerDay: 6, cube: 20, weight: 6 },
  { code: '03051360', name: 'BOC Single-Stage Oxygen Regulator', category: 'Welding', picksPerDay: 5, cube: 6, weight: 3, affinityGroup: 'welding-kit' },
  { code: '03052110', name: 'Holmatro Hydraulic Hose 2m', category: 'Hose & Fittings', picksPerDay: 5, cube: 8, weight: 4 },
  { code: '03041180', name: 'Nupla Fibreglass Sledge Hammer 4.5kg', category: 'Hand Tools', picksPerDay: 4, cube: 7, weight: 6 },
  { code: '03042330', name: 'Festool TS55 Plunge Track Saw', category: 'Power Tools', picksPerDay: 4, cube: 14, weight: 5 },
  { code: '03052160', name: 'Ryco Hydraulic Fitting Service Kit', category: 'Hose & Fittings', picksPerDay: 3, cube: 4, weight: 2 },
  { code: '03013520', name: 'Paratech Aluminium Rescue Strut', category: 'Storage & Handling', picksPerDay: 3, cube: 40, weight: 10 },
  { code: '03091080', name: 'Brady Floor Marking Tape 50m Yellow', category: 'Safety Signage', picksPerDay: 2, cube: 5, weight: 2, affinityGroup: 'site-setup' },
  { code: '03091120', name: 'Reflective Hi-Vis Bollard Cover', category: 'Safety Signage', picksPerDay: 2, cube: 6, weight: 1, affinityGroup: 'site-setup' },
  { code: '03052210', name: 'Enerpac 10T Hydraulic Bottle Jack', category: 'Hose & Fittings', picksPerDay: 1, cube: 9, weight: 8 },
  { code: '03013560', name: 'Crane 2T Manual Chain Block 3m', category: 'Storage & Handling', picksPerDay: 1, cube: 18, weight: 12 },
];

export function generateDemoSkus(): SkuSpec[] {
  return DEMO_SKUS;
}

/**
 * Deliberately BAD starting assignment: fastest movers into the farthest slots.
 * Returns a per-slot SKU code aligned to `slots` by index (null = empty). Used
 * for both the demo seed and freshly imported data so there's always a visible
 * slotting problem to diagnose and a big optimiser win.
 */
export function worstCaseAssignment(
  slots: SlotSpec[],
  skus: SkuSpec[]
): (string | null)[] {
  const skusByPicksDesc = [...skus].sort((a, b) => b.picksPerDay - a.picksPerDay);
  const slotsByDistDesc = slots
    .map((_, idx) => idx)
    .sort((i, j) => slots[j].x + slots[j].y - (slots[i].x + slots[i].y));

  const assignments: (string | null)[] = new Array(slots.length).fill(null);
  for (let i = 0; i < skusByPicksDesc.length && i < slotsByDistDesc.length; i++) {
    assignments[slotsByDistDesc[i]] = skusByPicksDesc[i].code;
  }
  return assignments;
}

/** Full demo DC: slot grid + demo SKUs + worst-case assignment. */
export function generateDc(): DcSeed {
  const slots = generateSlotGrid();
  const skus = generateDemoSkus();
  return { skus, slots, assignments: worstCaseAssignment(slots, skus) };
}
