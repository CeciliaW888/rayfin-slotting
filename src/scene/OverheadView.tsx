import { useMemo } from 'react';

import { EMPTY_COLOR } from '@/slotting/colors';
import { GOLDEN_LEVEL } from '@/slotting/types';
import type { SlotRow } from '@/slotting/types';

const ZONE_TINT: Record<string, string> = {
  chilled: '#eaf6fb',
  hazmat: '#fdf0e6',
  ambient: '#f1f6ee',
};
const ZONE_LABEL: Record<string, string> = {
  chilled: 'CHILLED',
  hazmat: 'HAZMAT / BULK',
  ambient: 'AMBIENT PICK',
};

const CW = 70; // location cell width
const CH = 60; // location cell height
const GAP = 8;
const LEFT = 104; // gutter for aisle/zone labels
const TOP = 64; // gutter for dock + bay headers

/**
 * 2D top-down operational map. Each aisle is a row, each bay a column, and the
 * three shelf levels are stacked bands inside a location cell (L3 top → L1
 * bottom). Colours come from the same `slotColors` map the 3D scene uses, so
 * the two views never diverge.
 */
export function OverheadView({
  slots,
  colorById,
  selectedSlotId,
  onSelectSlot,
}: {
  slots: SlotRow[];
  colorById: Map<string, string>;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}) {
  const { aisles, bays, levels, slotAt, zoneByAisle } = useMemo(() => {
    const aisles = [...new Set(slots.map((s) => s.aisle))].sort((a, b) => a - b);
    const bays = [...new Set(slots.map((s) => s.bay))].sort((a, b) => a - b);
    const levels = [...new Set(slots.map((s) => s.level))].sort((a, b) => b - a); // top→bottom
    const slotAt = new Map<string, SlotRow>();
    const zoneByAisle = new Map<number, string>();
    for (const s of slots) {
      slotAt.set(`${s.aisle}-${s.bay}-${s.level}`, s);
      if (s.zone && !zoneByAisle.has(s.aisle)) zoneByAisle.set(s.aisle, s.zone);
    }
    return { aisles, bays, levels, slotAt, zoneByAisle };
  }, [slots]);

  const width = LEFT + bays.length * (CW + GAP) + GAP;
  const height = TOP + aisles.length * (CH + GAP) + GAP;
  const bandH = CH / levels.length;

  return (
    <div className="h-full w-full overflow-auto bg-[#eef2f4] p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto block h-auto w-full max-w-4xl"
        role="img"
        aria-label="2D overhead view of the distribution centre"
      >
        {/* dock strip across the front edge */}
        <rect x={LEFT} y={16} width={bays.length * (CW + GAP) - GAP} height={28} rx={5} fill="#334155" />
        <text x={LEFT + 12} y={34} fill="#f8fafc" fontSize={13} fontWeight={700} letterSpacing={1}>
          ◄ DOCK · RECEIVE / SHIP
        </text>

        {/* bay column headers */}
        {bays.map((bay, c) => (
          <text
            key={`bay-${bay}`}
            x={LEFT + c * (CW + GAP) + CW / 2}
            y={58}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#64748b"
          >
            BAY {bay}
          </text>
        ))}

        {aisles.map((aisle, r) => {
          const zone = zoneByAisle.get(aisle) ?? 'ambient';
          const rowY = TOP + r * (CH + GAP);
          return (
            <g key={`aisle-${aisle}`}>
              {/* zone-tinted row band + label */}
              <rect
                x={4}
                y={rowY}
                width={width - 8}
                height={CH}
                rx={6}
                fill={ZONE_TINT[zone] ?? ZONE_TINT.ambient}
              />
              <text x={14} y={rowY + CH / 2 - 6} fontSize={12} fontWeight={700} fill="#334155">
                AISLE {aisle}
              </text>
              <text x={14} y={rowY + CH / 2 + 12} fontSize={9} fontWeight={600} fill="#94a3b8">
                {ZONE_LABEL[zone] ?? zone.toUpperCase()}
              </text>

              {bays.map((bay, c) => {
                const cellX = LEFT + c * (CW + GAP);
                return (
                  <g key={`loc-${aisle}-${bay}`}>
                    {levels.map((level, k) => {
                      const slot = slotAt.get(`${aisle}-${bay}-${level}`);
                      if (!slot) return null;
                      const fill = colorById.get(slot.id) ?? EMPTY_COLOR;
                      const selected = slot.id === selectedSlotId;
                      const by = rowY + k * bandH;
                      return (
                        <g key={slot.id}>
                          <rect
                            x={cellX}
                            y={by}
                            width={CW}
                            height={bandH - 1}
                            rx={2}
                            fill={fill}
                            stroke={selected ? '#111827' : '#ffffff'}
                            strokeWidth={selected ? 2.5 : 1}
                            className="cursor-pointer"
                            onClick={() => onSelectSlot(slot.id)}
                          >
                            <title>{`${slot.id}${slot.sku_id ? ` · ${slot.sku_id}` : ' · empty'}`}</title>
                          </rect>
                          {level === GOLDEN_LEVEL && (
                            <circle cx={cellX + CW - 7} cy={by + bandH / 2} r={2.4} fill="#b45309" />
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <p className="mx-auto mt-3 max-w-4xl text-center text-[11px] text-gray-400">
        Each cell is a rack location; the three stacked bands are shelf levels (L3 top → L1 bottom).
        The amber dot marks the golden zone (level&nbsp;{GOLDEN_LEVEL}).
      </p>
    </div>
  );
}
