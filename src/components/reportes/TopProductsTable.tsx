import { Card, CardHeader } from "@/components/ui/Card";
import type { ProductoVendido } from "@/lib/reportes";
import { formatoMoneda } from "@/lib/utils";

interface TopProductsTableProps {
  productos: ProductoVendido[];
}

export function TopProductsTable({ productos }: TopProductsTableProps) {
  const visibles = productos.slice(0, 5);
  const maximo = visibles[0]?.ingresos ?? 0;

  return (
    <Card>
      <CardHeader
        title="Productos más vendidos"
        subtitle="Ordenados por ingresos del periodo"
      />

      {visibles.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Sin ventas en este periodo.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((producto, indice) => {
            const porcentaje =
              maximo > 0 ? (producto.ingresos / maximo) * 100 : 0;

            return (
              <li key={producto.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-[11px] font-bold text-brand-light">
                  {indice + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {producto.name}
                    </p>
                    <p className="shrink-0 text-xs font-semibold text-slate-100">
                      {formatoMoneda(producto.ingresos)}
                    </p>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                    <span className="truncate font-mono">{producto.code}</span>
                    <span className="shrink-0">
                      {producto.unidades} unidad
                      {producto.unidades === 1 ? "" : "es"}
                    </span>
                  </div>

                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-brand-cyan/70"
                      style={{ width: `${Math.max(porcentaje, 2)}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
