"use client";

import { Package, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ProductoSeleccionable {
  code: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl?: string | null;
}

interface ProductPickerRowProps<T extends ProductoSeleccionable> {
  producto: T;
  isAdded: boolean;
  isProcessing: boolean;
  onToggle: (producto: T) => void;
}

/**
 * Fila del selector de productos para el live.
 * La imagen y los datos van grandes porque el vendedor elige rápido durante
 * la transmisión y no debe recorrer la lista buscando stock o precio.
 */
export function ProductPickerRow<T extends ProductoSeleccionable>({
  producto,
  isAdded,
  isProcessing,
  onToggle,
}: ProductPickerRowProps<T>) {
  const agotado = producto.stock === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-3 transition-colors",
        isAdded
          ? "border-estado-validado/40 bg-estado-validado/5"
          : "border-brand-primary/15 bg-brand-darkest/30 hover:border-surface-border"
      )}
    >
      {/* Imagen grande */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-primary/15">
        {producto.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imageUrl}
            alt={producto.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={28} className="text-slate-500" />
          </div>
        )}
      </div>

      {/* Datos */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-base font-semibold text-slate-100">
          {producto.name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-brand-primary/15 px-2 py-1 font-mono text-xs font-semibold text-brand-light">
            {producto.code}
          </span>

          <span
            className={cn(
              "rounded px-2 py-1 text-xs font-semibold",
              agotado
                ? "bg-red-500/15 text-estado-rechazado"
                : "bg-slate-700/40 text-slate-200"
            )}
          >
            Stock: {producto.stock}
          </span>

          <span className="rounded bg-estado-validado/15 px-2 py-1 text-xs font-bold text-estado-validado">
            Bs {Number(producto.price).toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        variant={isAdded ? "outline" : "primary"}
        className="min-w-[104px] shrink-0"
        onClick={() => onToggle(producto)}
        disabled={isProcessing || agotado}
      >
        {isProcessing ? (
          "..."
        ) : isAdded ? (
          <>
            <Check size={16} />
            Quitar
          </>
        ) : (
          <>
            <Plus size={16} />
            Agregar
          </>
        )}
      </Button>
    </div>
  );
}