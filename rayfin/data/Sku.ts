import { entity, authenticated, uuid, text, int, decimal } from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class Sku {
  @uuid() id!: string;
  @text({ max: 32 }) code!: string;
  @text({ max: 100 }) name!: string;
  @text({ max: 50 }) category!: string;
  @int({ min: 0 }) picksPerDay!: number;
  @decimal({ optional: true }) cube?: number;
  @decimal({ optional: true }) weight?: number;
  @decimal({ optional: true }) forecastMultiplier?: number;
  @text({ max: 50, optional: true }) affinityGroup?: string;
}
