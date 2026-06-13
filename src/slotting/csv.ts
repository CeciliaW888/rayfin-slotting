import type { SkuSpec } from './seed';

export interface ParsedCsv {
  skus: SkuSpec[];
  errors: string[];
}

const HEADER_ALIASES: Record<keyof SkuSpec, string[]> = {
  code: ['code', 'sku', 'sku_code', 'item'],
  name: ['name', 'description', 'desc'],
  category: ['category', 'cat', 'group'],
  picksPerDay: ['picksperday', 'picks', 'pickrate', 'velocity', 'pickspday'],
  cube: ['cube', 'volume', 'cubicvolume', 'cubicflow'],
  weight: ['weight', 'unitweight', 'caseweight'],
  forecastMultiplier: ['forecastmultiplier', 'forecast', 'uplift', 'promouplift'],
  affinityGroup: ['affinitygroup', 'affinity', 'family', 'ordergroup'],
};

const REQUIRED_COLUMNS: (keyof SkuSpec)[] = ['code', 'name', 'category', 'picksPerDay'];

function splitLine(line: string): string[] {
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
}

function resolveColumns(header: string[]): Partial<Record<keyof SkuSpec, number>> | null {
  const norm = header.map((h) => h.toLowerCase().replace(/[\s_]/g, ''));
  const idx: Partial<Record<keyof SkuSpec, number>> = {};
  for (const key of Object.keys(HEADER_ALIASES) as (keyof SkuSpec)[]) {
    const aliases = HEADER_ALIASES[key].map((a) => a.replace(/[\s_]/g, ''));
    const found = norm.findIndex((h) => aliases.includes(h));
    if (found !== -1) idx[key] = found;
  }
  if (REQUIRED_COLUMNS.some((key) => idx[key] === undefined)) return null;
  return idx;
}

function optionalNumber(cells: string[], index: number | undefined): number | undefined {
  if (index === undefined) return undefined;
  const raw = cells[index];
  if (raw === undefined || raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Parse a SKU CSV with a header row. Required columns (aliases accepted):
 * code, name, category, picksPerDay. Bad rows are skipped and reported; the
 * caller decides whether the valid rows are enough to import.
 */
export function parseSkuCsv(text: string): ParsedCsv {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { skus: [], errors: ['CSV needs a header row and at least one data row.'] };
  }

  const cols = resolveColumns(splitLine(lines[0]));
  if (!cols) {
    return {
      skus: [],
      errors: ['Missing required columns. Expected: code, name, category, picksPerDay.'],
    };
  }

  const skus: SkuSpec[] = [];
  const errors: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    const code = cells[cols.code!] ?? '';
    const name = cells[cols.name!] ?? '';
    const category = cells[cols.category!] ?? '';
    const picks = Number(cells[cols.picksPerDay!]);

    if (!code) {
      errors.push(`Row ${i + 1}: missing code — skipped.`);
      continue;
    }
    if (!Number.isFinite(picks) || picks < 0) {
      errors.push(`Row ${i + 1} (${code}): invalid picksPerDay — skipped.`);
      continue;
    }
    const affinityGroup = cols.affinityGroup === undefined ? '' : cells[cols.affinityGroup] ?? '';
    skus.push({
      code: code.slice(0, 32),
      name: (name || code).slice(0, 100),
      category: (category || 'Uncategorised').slice(0, 50),
      picksPerDay: Math.round(picks),
      cube: optionalNumber(cells, cols.cube),
      weight: optionalNumber(cells, cols.weight),
      forecastMultiplier: optionalNumber(cells, cols.forecastMultiplier),
      affinityGroup: affinityGroup ? affinityGroup.slice(0, 50) : undefined,
    });
  }

  return { skus, errors };
}
