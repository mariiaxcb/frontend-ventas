"use client";

import { Clock, User, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { Pedido } from "@/types/pedido";

interface OrderCardProps {
  pedido: Pedido;
  onView?: (pedido: Pedido) => void;
}

export function OrderCard({ pedido, onView }: OrderCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-brand-cyan/30"
      variant="default"
    >
      <div onClick={() => onView?.(pedido)}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-brand-primary/10 p-2">
              <Package size={16} className="text-brand-light" />
            </div>
            <div>
              <p className="font-mono text-xs text-slate-400">#{pedido.id}</p>
              <p className="font-poppins text-sm font-semibold text-slate-100">
                {pedido.usuarioTiktok}
              </p>
            </div>
          </div>
          <Badge estado={pedido.estado} />
        </div>

        <div className="mb-3 space-y-1">
          <p className="text-sm text-slate-200">{pedido.productoNombre}</p>
          <p className="text-xs text-slate-400">Cantidad: {pedido.cantidad}</p>
        </div>

        <div className="flex items-center justify-between border-t border-brand-primary/10 pt-3">
          <span className="font-poppins text-lg font-bold text-brand-cyan">
            {formatoMoneda(pedido.total)}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {formatoFecha(pedido.createdAt)}
          </div>
        </div>
      </div>
    </Card>
  );
}
