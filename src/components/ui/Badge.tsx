import { cn } from "@/lib/utils";
import { ESTADO_PEDIDO_LABELS, type EstadoPedido } from "@/types/pedido";

/** Colores por estado, alineados con la paleta de la marca. */
const ESTADO_STYLES: Record<EstadoPedido, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  IN_REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  DELIVERED: "bg-brand-primary/10 text-brand-light border-brand-primary/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

export function Badge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ESTADO_STYLES[estado]
      )}
    >
      {ESTADO_PEDIDO_LABELS[estado]}
    </span>
  );
}