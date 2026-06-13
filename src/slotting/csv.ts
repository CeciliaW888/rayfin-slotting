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
};

function splitLine(line: string): string[] {
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
}

function resolveColumns(header: string[]): Record<keyof SkuSpec, number> | null {
  const norm = header.map((h) => h.toLowerCase().replace(/[\s_]/g, ''));
  const idx = {} as Record<keyof SkuSpec, number>;
  for (const key of Object.keys(HEADER_ALIASES) as (keyof SkuSpec)[]) {
    const aliases = HEADER_ALIASES[key].map((a) => a.replace(/[\s_]/g, ''));
    const found = norm.findIndex((h) => aliases.includes(h));
    if (found === -1) return null;
    idx[key] = found;
  }
  return idx;
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
    const code = cells[cols.code] ?? '';
    const name = cells[cols.name] ?? '';
    const category = cells[cols.category] ?? '';
    const picks = Number(cells[cols.picksPerDay]);

    if (!code) {
      errors.push(`Row ${i + 1}: missing code — skipped.`);
      continue;
    }
    if (!Number.isFinite(picks) || picks < 0) {
      errors.push(`Row ${i + 1} (${code}): invalid picksPerDay — skipped.`);
      continue;
    }
    skus.push({
      code: code.slice(0, 32),
      name: (name || code).slice(0, 100),
      category: (category || 'Uncategorised').slice(0, 50),
      picksPerDay: Math.round(picks),
    });
  }

  return { skus, errors };
}
