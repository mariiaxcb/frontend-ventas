"use client";

import { Package, ShoppingCart, Boxes } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatoMoneda } from "@/lib/utils";
import type { ResumenProducto } from "@/services/streams.api";

interface LiveSummaryStockProps {
  productos: ResumenProducto[];
}

/** Stock restante de los productos ofertados durante el live. */
export function LiveSummaryStock({ productos }: LiveSummaryStockProps) {
  return (
    <Card>
      <CardHeader
        title="Stock de los productos ofertados"
        subtitle="Unidades disponibles al finalizar la transmisión"
      />
      <CardContent>
        {productos.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No se ofertaron productos"
            description="Este live no tuvo productos en oferta."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs text-slate-300">
              <thead className="border-b border-surface-border text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider">Producto</th>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider">Precio</th>
                  <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">
                    Vendidos
                  </th>
                  <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">
                    Stock restante
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {productos.map((producto) => {
                  const agotado = producto.stock === 0;

                  return (
                    <tr key={producto.id} className="hover:bg-brand-primary/10">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {producto.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={producto.imageUrl}
                              alt={producto.name}
                              className="h-9 w-9 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary/15">
                              <Package size={16} className="text-slate-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-100">{producto.name}</p>
                            <p className="text-[11px] text-slate-400">{producto.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-estado-validado">
                        {formatoMoneda(Number(producto.price))}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <ShoppingCart size={12} className="text-estado-validado" />
                          {producto.sold}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={
                            agotado
                              ? "rounded bg-red-500/10 px-2 py-1 font-bold text-estado-rechazado"
                              : producto.stock <= 5
                                ? "rounded bg-estado-pendiente/10 px-2 py-1 font-bold text-estado-pendiente"
                                : "rounded bg-brand-primary/15 px-2 py-1 font-bold text-brand-cyan"
                          }
                        >
                          {producto.stock}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}