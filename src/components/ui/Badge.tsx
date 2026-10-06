import { cn } from "@/lib/utils";
import { ESTADO_PEDIDO_LABELS, type EstadoPedido } from "@/types/pedido";

/**
 * Colores por estado del pedido.
 *
 * El verde se reserva para lo que entro dinero (pagada, entregada), el ambar
 * para lo que espera accion del vendedor y el rojo para lo que salio mal. Asi
 * el vendedor lee el tablero de un vistazo sin leer los textos.
 */
const ESTADO_STYLES: Record<EstadoPedido, string> = {
  PENDING: "bg-estado-pendiente/10 text-estado-pendiente border-estado-pendiente/30",
  IN_REVIEW: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  PAID: "bg-estado-validado/10 text-estado-validado border-estado-validado/30",
  DELIVERED: "bg-brand-primary/15 text-brand-light border-brand-primary/30",
  REJECTED: "bg-estado-rechazado/10 text-estado-rechazado border-estado-rechazado/30",
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