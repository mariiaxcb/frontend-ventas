import { cn } from "@/lib/utils";
import { ESTADO_COLORS, ESTADO_LABELS } from "@/lib/constants";
import type { EstadoPedido } from "@/types/pedido";

export function Badge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ESTADO_COLORS[estado]
      )}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}
