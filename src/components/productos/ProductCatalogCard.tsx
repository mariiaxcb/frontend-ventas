import { Package, Tag, Edit, Trash2 } from "lucide-react";
import { IconAction } from "./IconAction";
import { formatoBs } from "@/lib/productos";

interface ProductCatalogCardProps {
  producto: any;
  onDesactivar: (producto: any) => void;
}

function stockBorder(stock: number) {
  if (stock <= 0)
    return "border-estado-rechazado/50 hover:border-estado-rechazado hover:shadow-estado-rechazado/10";
  if (stock === 1)
    return "border-amber-400/50 hover:border-amber-400 hover:shadow-amber-400/10";
  return "border-estado-validado/50 hover:border-estado-validado hover:shadow-estado-validado/10";
}

export function ProductCatalogCard({ producto, onDesactivar }: ProductCatalogCardProps) {
  const stock = Number(producto.stock ?? 0);

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 bg-brand-dark shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${stockBorder(stock)}`}
    >
      {/* Imagen */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-brand-darkest">
        {producto.imageUrl ? (
          <img
            src={producto.imageUrl}
            alt={producto.name}
            loading="lazy"
            className="h-full w-full object-contain object-center p-1.5 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package size={48} className="text-slate-600" />
        )}

        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          {producto.code ? (
            <span className="flex max-w-[55%] items-center gap-1 rounded-md border border-surface-border bg-brand-darkest/85 px-2 py-1 font-mono text-xs text-slate-200 backdrop-blur-sm">
              <Tag size={12} className="shrink-0 text-brand-cyan" />
              <span className="truncate">{producto.code}</span>
            </span>
          ) : (
            <span />
          )}

          {producto.category?.name && (
            <span className="max-w-[45%] truncate rounded-md border border-brand-cyan/30 bg-brand-darkest/85 px-2 py-1 text-xs font-semibold text-brand-cyan backdrop-blur-sm">
              {producto.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-5 text-slate-100">
            {producto.name}
          </h3>
          <p className="line-clamp-1 text-[11px] leading-4 text-slate-400">
            {producto.description || "Sin descripción"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-surface-border pt-2">
          <span className="text-base font-bold leading-5 text-brand-cyan">
            {formatoBs(producto.price)}
          </span>

          <div className="flex gap-1.5">
            <IconAction
              label="Editar"
              icon={Edit}
              href={`/products/edit/${producto.id}`}
            />
            <IconAction
              label="Desactivar"
              icon={Trash2}
              variant="danger"
              onClick={() => onDesactivar(producto)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}