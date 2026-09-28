"use client";

import { Link } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { Pedido } from "@/types/pedido";

interface RecentOrdersProps {
  pedidos: Pedido[];
  isLoading?: boolean;
}

export function RecentOrders({ pedidos, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Pedidos Recientes" />
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-4 w-32" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
                <Skeleton variant="text" className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Pedidos Recientes"
        subtitle="Últimos pedidos registrados"
        action={
          <Link
            href="/orders"
            className="text-xs font-medium text-brand-light hover:text-brand-cyan"
          >
            Ver todos →
          </Link>
        }
      />
      <CardContent>
        {pedidos.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No hay pedidos recientes
          </p>
        ) : (
          <div className="space-y-3">
            {pedidos.slice(0, 5).map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {pedido.usuarioTiktok}
                    </p>
                    <p className="text-xs text-slate-400">
                      {pedido.productoNombre} · {formatoFecha(pedido.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-poppins text-sm font-semibold text-brand-cyan">
                    {formatoMoneda(pedido.total)}
                  </span>
                  <Badge estado={pedido.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
