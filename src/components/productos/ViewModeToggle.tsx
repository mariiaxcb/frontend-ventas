import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "table";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPCIONES = [
  { mode: "grid" as const, label: "Catálogo", icon: LayoutGrid },
  { mode: "table" as const, label: "Tabla", icon: List },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Modo de vista"
      className="flex items-center gap-1 rounded-xl border border-surface-border bg-brand-dark p-1"
    >
      {OPCIONES.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === mode
              ? "bg-brand-cyan font-semibold text-brand-darkest shadow-sm"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}