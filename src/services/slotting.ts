import { AuthError } from '@microsoft/rayfin-client';

import { getGlobalSessionExpiredHandler } from '@/hooks/AuthContext';
import {
  generateDc,
  generateSlotGrid,
  worstCaseAssignment,
  type SkuSpec,
  type SlotSpec,
} from '@/slotting/seed';
import type { SkuRow, SlotRow } from '@/slotting/types';

import { getRayfinClient } from './rayfinClient';

/** Re-throw after triggering session expiry if it's an auth error. */
function handleError(err: unknown): never {
  const isAuthError =
    err instanceof AuthError ||
    (err instanceof Error && 'status' in err && (err as { status: number }).status === 401);

  if (isAuthError) {
    const handler = getGlobalSessionExpiredHandler();
    if (handler) handler();
  }
  throw err;
}

export async function getSkus(): Promise<SkuRow[]> {
  try {
    const client = getRayfinClient();
    const rows = await client.data.Sku.select([
      'id',
      'code',
      'name',
      'category',
      'picksPerDay',
    ]).execute();
    return rows as SkuRow[];
  } catch (err) {
    handleError(err);
  }
}

export async function getSlots(): Promise<SlotRow[]> {
  try {
    const client = getRayfinClient();
    const rows = await client.data.Slot.select([
      'id',
      'aisle',
      'bay',
      'level',
      'x',
      'y',
      'sku_id',
    ]).execute();
    return rows as SlotRow[];
  } catch (err) {
    handleError(err);
  }
}

export async function reslot(slotId: string, skuId: string | null): Promise<void> {
  try {
    const client = getRayfinClient();
    await client.data.Slot.update({ id: slotId }, { sku_id: skuId ?? undefined });
  } catch (err) {
    handleError(err);
  }
}

/** Create SKUs then slots, wiring each slot to its assigned SKU's new id. */
async function createDc(
  skuSpecs: SkuSpec[],
  slots: SlotSpec[],
  assignments: (string | null)[]
): Promise<void> {
  const client = getRayfinClient();
  const codeToId = new Map<string, string>();
  for (const sku of skuSpecs) {
    const created = await client.data.Sku.create({
      code: sku.code,
      name: sku.name,
      category: sku.category,
      picksPerDay: sku.picksPerDay,
    });
    codeToId.set(sku.code, (created as { id: string }).id);
  }
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const code = assignments[i];
    await client.data.Slot.create({
      aisle: slot.aisle,
      bay: slot.bay,
      level: slot.level,
      x: slot.x,
      y: slot.y,
      sku_id: code ? codeToId.get(code) : undefined,
    });
  }
}

/** Delete all slots (FK children) then all SKUs. */
async function clearAll(): Promise<void> {
  const client = getRayfinClient();
  const slots = (await client.data.Slot.select(['id']).execute()) as { id: string }[];
  for (const s of slots) await client.data.Slot.delete({ id: s.id });
  const skus = (await client.data.Sku.select(['id']).execute()) as { id: string }[];
  for (const s of skus) await client.data.Sku.delete({ id: s.id });
}

/**
 * Seed the shared DC once. `count()` isn't available on the client, so we
 * select minimal fields and check length (per Rayfin known limitations).
 */
export async function seedIfEmpty(): Promise<void> {
  try {
    const client = getRayfinClient();
    const existing = await client.data.Sku.select(['id']).execute();
    if (existing.length > 0) return;
    const { skus, slots, assignments } = generateDc();
    await createDc(skus, slots, assignments);
  } catch (err) {
    handleError(err);
  }
}

/** Replace the whole DC with imported SKUs, placed into the standard slot grid. */
export async function importSkus(skuSpecs: SkuSpec[]): Promise<void> {
  try {
    await clearAll();
    const slots = generateSlotGrid();
    const assignments = worstCaseAssignment(slots, skuSpecs);
    await createDc(skuSpecs, slots, assignments);
  } catch (err) {
    handleError(err);
  }
}
