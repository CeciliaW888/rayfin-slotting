import { entity, authenticated, uuid, int, decimal, one } from '@microsoft/rayfin-core';

import { Sku } from './Sku.js';

// A Slot holds at most one Sku. The shared DC is visible to every
// authenticated user (no per-user policy) — see ADR 0001.
@entity()
@authenticated('*')
export class Slot {
  @uuid() id!: string;
  @int({ min: 1 }) aisle!: number;
  @int({ min: 1 }) bay!: number;
  @int({ min: 1, max: 3 }) level!: number;
  @decimal() x!: number;
  @decimal() y!: number;
  @uuid({ optional: true }) sku_id?: string;
  @one(() => Sku, { optional: true }) sku?: Sku;
}
