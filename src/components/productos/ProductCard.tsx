"use client";

import Image from "next/image";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatoMoneda } from "@/lib/utils";
import type { Producto } from "@/types/producto";

interface ProductCardProps {
  producto: Producto;
  onEdit?: (producto: Producto) => void;
  onDelete?: (producto: Producto) => void;
}

export function ProductCard({ producto, onEdit, onDelete }: ProductCardProps) {
  const isActive = producto.estado === "ACTIVE" || (producto as any).activo || true;

  return (
    <Card className="group relative overflow-hidden">
      <div className="relative h-48 overflow-hidden rounded-lg bg-brand-darkest/50">
        {producto.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.image}
            alt={producto.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={48} className="text-slate-600" />
          </div>
        )}

        {/* Código badge */}
        {producto.code && (
          <span className="absolute left-2 top-2 rounded border border-brand-primary/30 bg-brand-darkest/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-sm">
            {producto.code}
          </span>
        )}

        {/* Estado badge */}
        <div className="absolute right-2 top-2">
          <Badge estado={isActive ? "VALIDADO" : "RECHAZADO"} />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-poppins text-base font-semibold text-slate-100">
            {producto.name}
          </h3>
          {producto.category?.nombre && (
            <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-light">
              {producto.category.nombre}
            </span>
          )}
        </div>

        {producto.description && (
          <p className="mb-3 line-clamp-2 text-xs text-slate-400">{producto.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-brand-primary/10 pt-3">
          <span className="font-poppins text-lg font-bold text-brand-cyan">
            {formatoMoneda(Number(producto.price))}
          </span>
          <span className="text-xs text-slate-400">Stock: {producto.stock}</span>
        </div>

        {(onEdit || onDelete) && (
          <div className="mt-3 flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                className="flex-1 py-1.5 text-xs"
                onClick={() => onEdit(producto)}
              >
                <Edit size={14} />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                className="flex-1 py-1.5 text-xs"
                onClick={() => onDelete(producto)}
              >
                <Trash2 size={14} />
                Eliminar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
