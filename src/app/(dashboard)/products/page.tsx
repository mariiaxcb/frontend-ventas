"use client";

import Link from "next/link";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProductos, useEliminarProducto } from "@/hooks/useProductos";
import { formatoMoneda } from "@/lib/utils";

export default function ProductosPage() {
  const { data: productos, isLoading } = useProductos();
  const eliminarProducto = useEliminarProducto();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Catálogo de Productos
        </h1>
        <Link href="/productos/crear">
          <Button>
            <Plus size={16} className="mr-2" /> Nuevo producto
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-gray-400">Cargando productos...</div>
      )}

      {/* Grid Modo Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(productos ?? []).map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-slate-700 transition-all"
          >
            {/* Imagen del producto */}
            <div className="h-48 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {p.imagen ? (
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={48} className="text-slate-700" />
              )}
              <span className="absolute top-2 right-2 bg-slate-900/80 text-xs px-2 py-1 rounded text-gray-300 backdrop-blur-sm border border-slate-700">
                {p.categoria || "Sin categoría"}
              </span>
            </div>

            {/* Contenido */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">{p.nombre}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {p.descripcion || "Sin descripción disponible."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-brand-cyan">
                    {formatoMoneda(p.precio)}
                  </span>
                  <span className="text-xs text-gray-400">
                    Stock: <strong className="text-white">{p.stock}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {p.estado ?? "ACTIVE"}
                  </span>

                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      onClick={() => eliminarProducto.mutate(p.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}