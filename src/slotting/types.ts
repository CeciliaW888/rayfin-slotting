export interface SkuRow {
  id: string;
  code: string;
  name: string;
  category: string;
  picksPerDay: number;
}

export interface SlotRow {
  id: string;
  aisle: number;
  bay: number;
  level: number;
  x: number;
  y: number;
  sku_id?: string | null;
}

export type AbcClass = 'A' | 'B' | 'C';

// The dock sits at the origin; travel is measured from each slot to here.
export const DOCK = { x: 0, y: 0 };

// Level 2 is the reach-height "golden zone" where fast movers belong.
export const GOLDEN_LEVEL = 2;
