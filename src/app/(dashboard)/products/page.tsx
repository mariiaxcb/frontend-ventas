"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductFilters } from "@/components/productos/ProductFilters";
import { ViewModeToggle, type ViewMode } from "@/components/productos/ViewModeToggle";
import { ProductCatalogGrid } from "@/components/productos/ProductCatalogGrid";
import { ProductTable } from "@/components/productos/ProductTable";
import { ProductStatusModal } from "@/components/productos/ProductStatusModal";
import { ProductEmpty } from "@/components/productos/ProductEmpty";
import { useProductos, useCategorias } from "@/hooks/useProductos";
import { useProductosFiltrados } from "@/hooks/useProductosFiltrados";
import { useCambioEstadoProducto } from "@/hooks/useCambioEstadoProducto";
import type { Producto } from "@/types/producto";
import { IconAction } from "@/components/productos/IconAction";

export default function ProductosPage() {
  const { data: productos, isLoading, isError, refetch } = useProductos();
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { filtros, cambiarFiltro, limpiarFiltros, productosFiltrados, productosActivos } =
    useProductosFiltrados(productos as Producto[] | undefined);

  const estado = useCambioEstadoProducto(refetch);

  const total = productos?.length ?? 0;
  const hayDatos = !isLoading && !isError && total > 0;

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl font-poppins">
          Catálogo de Productos
        </h1>
      </div>

      {/* 2. Buscador y Filtros */}
      {hayDatos && (
        <ProductFilters
          filtros={filtros}
          onCambio={cambiarFiltro}
          onLimpiar={limpiarFiltros}
          categorias={categorias ?? []}
          cargandoCategorias={cargandoCategorias}
          total={total}
          visibles={viewMode === "grid" ? productosActivos.length : productosFiltrados.length}
        />
      )}

      {/* 3. Botones de Acción (Toggle de Vista y Agregar Producto) */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <IconAction
          label="Nuevo producto"
          icon={Plus}
          href="/products/add"
          variant="primary"
          size={18}
          side="bottom"
        />
      </div>

      {/* Contenido principal (Grilla / Tabla) */}
      {isLoading && (
        <div className="py-12 text-center text-slate-400">Cargando catálogo...</div>
      )}

      {isError && (
        <div className="py-12 text-center text-estado-rechazado">
          Error al obtener los productos.
        </div>
      )}

      {!isLoading && !isError && total === 0 && (
        <ProductEmpty>
          <p className="text-slate-400">No hay productos registrados.</p>
        </ProductEmpty>
      )}

      {hayDatos && productosFiltrados.length === 0 && (
        <ProductEmpty>
          <p className="text-slate-400">Ningún producto coincide con los filtros aplicados.</p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-3 text-xs font-semibold text-brand-cyan transition-colors hover:text-emerald-400"
          >
            Limpiar filtros
          </button>
        </ProductEmpty>
      )}

      {hayDatos && viewMode === "grid" && productosFiltrados.length > 0 && (
        productosActivos.length === 0 ? (
          <ProductEmpty>
            <p className="text-slate-400">
              No hay productos activos. Cambia a la vista de tabla o activa alguno
              para verlo en el catálogo.
            </p>
          </ProductEmpty>
        ) : (
          <ProductCatalogGrid
            productos={productosActivos}
            onDesactivar={(p) => estado.abrir(p.id, p.name, true)}
          />
        )
      )}

      {hayDatos && viewMode === "table" && productosFiltrados.length > 0 && (
        <ProductTable
          productos={productosFiltrados}
          onCambiarEstado={(p, isActive) => estado.abrir(p.id, p.name, isActive)}
        />
      )}

      <ProductStatusModal
        isOpen={estado.isOpen}
        producto={estado.selected}
        isLoading={estado.processing}
        onClose={estado.cerrar}
        onConfirm={estado.confirmar}
      />
    </div>
  );
}