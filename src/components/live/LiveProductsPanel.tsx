"use client";

import { Package, Plus, Users, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatoMoneda } from "@/lib/utils";
import type { ProductoLive } from "@/types/live";

interface LiveProductsPanelProps {
  productos: ProductoLive[];
  onAddProduct: () => void;
}

export function LiveProductsPanel({ productos, onAddProduct }: LiveProductsPanelProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-brand-cyan" />
          <h3 className="font-poppins text-sm font-semibold text-slate-100">
            Productos en Oferta
          </h3>
        </div>
        <Button variant="primary" className="py-1.5 text-xs" onClick={onAddProduct}>
          <Plus size={14} />
          Ofertar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {productos.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No hay productos ofertados
          </div>
        ) : (
          <div className="space-y-2">
            {productos.map((producto) => (
              <div
                key={producto.code}
                className="rounded-lg border border-surface-border bg-brand-darkest/30 p-3"
              >
                <div className="flex items-start gap-3">
                  {producto.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={producto.imageUrl}
                      alt={producto.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/15">
                      <Package size={20} className="text-slate-500" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{producto.name}</p>
                        <p className="text-xs text-slate-400">{producto.code}</p>
                      </div>
                      <span className="font-poppins text-sm font-bold text-brand-cyan">
                        {formatoMoneda(producto.price)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Package size={12} />
                        <span>Stock: {producto.stock}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-brand-light">
                        <Users size={12} />
                        <span>Reservados: {producto.reservados}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-estado-validado">
                        <ShoppingCart size={12} />
                        <span>Vendidos: {producto.vendidos}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
