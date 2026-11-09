import type { ReactNode } from "react";

export const FIELD_CLASS =
  "w-full bg-brand-raised border border-surface-border text-slate-100 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan";

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      {children}
    </div>
  );
}