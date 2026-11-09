import { Card, CardHeader } from "@/components/ui/Card";
import { ESTADO_LABELS } from "@/lib/constants";
import type { EstadoResumen } from "@/lib/reportes";
import type { EstadoPedido } from "@/types/pedido";
import { cn, formatoMoneda } from "@/lib/utils";

const BARRA: Record<EstadoPedido, string> = {
  PENDING: "bg-estado-pendiente",
  IN_REVIEW: "bg-sky-400",
  PAID: "bg-estado-validado",
  DELIVERED: "bg-brand-light",
  REJECTED: "bg-estado-rechazado",
  CANCELLED: "bg-slate-500",
};

interface StatusBreakdownProps {
  estados: EstadoResumen[];
  totalPedidos: number;
}

export function StatusBreakdown({
  estados,
  totalPedidos,
}: StatusBreakdownProps) {
  return (
    <Card>
      <CardHeader
        title="Pedidos por estado"
        subtitle={`${totalPedidos} pedido${totalPedidos === 1 ? "" : "s"} en el periodo`}
      />

      {estados.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Sin pedidos en este periodo.
        </p>
      ) : (
        <ul className="space-y-3">
          {estados.map((fila) => {
            const porcentaje =
              totalPedidos > 0 ? (fila.cantidad / totalPedidos) * 100 : 0;

            return (
              <li key={fila.estado}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-300">
                    {ESTADO_LABELS[fila.estado] ?? fila.estado}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    <span className="font-semibold text-slate-200">
                      {fila.cantidad}
                    </span>{" "}
                    · {formatoMoneda(fila.monto)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className={cn("h-full rounded-full", BARRA[fila.estado])}
                    style={{ width: `${Math.max(porcentaje, 2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
