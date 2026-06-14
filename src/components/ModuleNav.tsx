export type ModuleId =
  | 'dashboard'
  | 'twin'
  | 'moves'
  | 'orders'
  | 'items'
  | 'slots'
  | 'scenarios'
  | 'reports';

interface ModuleDef {
  id: ModuleId;
  label: string;
  hint: string;
  icon: string; // line-art SVG path data (24×24 viewBox)
  ready: boolean;
}

// Line-art glyphs (stroked, not filled) keep the nav light per the house style.
export const MODULES: ModuleDef[] = [
  { id: 'dashboard', label: 'Dashboard', hint: 'KPIs & opportunity', ready: true, icon: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z' },
  { id: 'twin', label: 'Digital Twin', hint: '3D / 2D warehouse', ready: true, icon: 'M12 2 2 7l10 5 10-5-10-5Zm0 7L2 14l10 5 10-5M2 14v3l10 5 10-5v-3' },
  { id: 'moves', label: 'Moves', hint: 'AI recommendations', ready: true, icon: 'M5 12h14M13 6l6 6-6 6' },
  { id: 'orders', label: 'Orders', hint: 'Pick-path tracing', ready: true, icon: 'M9 5h6a2 2 0 0 1 2 2v12l-5-3-5 3V7a2 2 0 0 1 2-2Z' },
  { id: 'items', label: 'Items', hint: 'SKU master', ready: true, icon: 'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' },
  { id: 'slots', label: 'Slots', hint: 'Locations', ready: true, icon: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z' },
  { id: 'scenarios', label: 'Scenarios', hint: 'Compare strategies', ready: false, icon: 'M4 4v16M4 8h12l-2-2m2 2-2 2M4 16h8l-2-2m2 2-2 2' },
  { id: 'reports', label: 'Reports', hint: 'Worst-slotted & storage', ready: true, icon: 'M4 4h16v16H4V4Zm4 12V9m4 7V7m4 9v-4' },
];

export function ModuleNav({
  active,
  onSelect,
}: {
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
}) {
  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-warmborder bg-page p-2 md:w-56 md:flex-col md:gap-0.5 md:overflow-x-visible md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
      <p className="hidden px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted md:block">
        Workstation
      </p>
      {MODULES.map((m) => {
        const isActive = m.id === active;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            disabled={!m.ready}
            className={[
              'flex shrink-0 items-center gap-3 rounded-r-md border-l-2 px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'border-accent bg-accent/10 text-accent-deep'
                : m.ready
                  ? 'border-transparent text-ink2 hover:bg-card'
                  : 'cursor-not-allowed border-transparent text-gray-300',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke={isActive ? '#c4825a' : 'currentColor'}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={m.icon} />
            </svg>
            <span className="hidden min-w-0 md:block">
              <span className="block font-medium leading-tight">{m.label}</span>
              <span className="block truncate text-[11px] text-gray-400">
                {m.ready ? m.hint : 'Coming soon'}
              </span>
            </span>
            <span className="md:hidden">{m.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
