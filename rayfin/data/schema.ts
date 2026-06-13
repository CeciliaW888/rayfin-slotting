import { Slot } from './Slot.js';
import { Sku } from './Sku.js';

export type SlottingSchema = {
  Slot: Slot;
  Sku: Sku;
};

export const schema = [Slot, Sku];
