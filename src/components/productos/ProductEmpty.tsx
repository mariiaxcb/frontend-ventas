import type { ReactNode } from "react";
import { Package } from "lucide-react";

export function ProductEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-surface-border py-12 text-center">
      <Package className="mx-auto mb-2 text-slate-500" size={40} />
      {children}
    </div>
  );
}