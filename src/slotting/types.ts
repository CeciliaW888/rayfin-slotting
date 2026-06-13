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
  zone?: string | null;
  sku_id?: string | null;
}

export type SkuSpec = Omit<SkuRow, 'id'>;
export type SlotSpec = Omit<SlotRow, 'id' | 'sku_id'>;

export type AbcClass = 'A' | 'B' | 'C';

// The dock sits at the centre of the front edge; travel is measured to here.
export const DOCK = { x: 12, y: 0 };

// Level 2 is the reach-height "golden zone" where fast movers belong.
export const GOLDEN_LEVEL = 2;
