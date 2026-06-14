import { useMemo } from 'react';

import { pickRoute, type Order } from '@/slotting/orders';
import type { SlotRow } from '@/slotting/types';

export function OrdersPanel({
  orders,
  slots,
  selectedOrderId,
  onSelectOrder,
}: {
  orders: Order[];
  slots: SlotRow[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
}) {
  const rows = useMemo(
    () =>
      orders
        .map((o) => ({ order: o, route: pickRoute(o, slots) }))
        .sort((a, b) => b.route.distance - a.route.distance),
    [orders, slots]
  );

  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-gray-100">
        {rows.map(({ order, route }) => {
          const selected = order.id === selectedOrderId;
          return (
            <li key={order.id}>
              <button
                onClick={() => onSelectOrder(order.id)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                  selected ? 'bg-[#c4825a]/12' : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-gray-700">{order.id}</p>
                  <p className="text-[11px] text-gray-400">
                    {order.lines.length} line{order.lines.length === 1 ? '' : 's'} ·{' '}
                    {order.lines.reduce((n, l) => n + l.qty, 0)} units
                  </p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-gray-800">
                    {route.distance.toFixed(0)}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-gray-400">travel</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
