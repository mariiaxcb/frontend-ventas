"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Package, Edit, Trash2, LayoutGrid, List, Tag, Power } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/modal/confirmModal";
import {
  ProductFilters,
  type ProductFiltersState,
  type OrdenProductos,
  type EstadoFiltro,
} from "@/components/productos/ProductFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { useProductos, useCategorias } from "@/hooks/useProductos";
import { productosApi } from "@/services/productos.api";
import type { Producto } from "@/types/producto";

/** Filtros iniciales: sin búsqueda, orden por más reciente y sin acotar. */
const FILTROS_INICIALES: ProductFiltersState = {
  busqueda: "",
  orden: "recientes",
  categoriaId: "",
  estado: "todos",
};

/** El nombre normalizado permite comparar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Un producto está activo si su `status` lo dice. `isActive` y `activo` son los
 * nombres que usaba la versión anterior, y se aceptan para no romper datos
 * que vengan con esos nombres.
 */
function estaActivo(producto: any): boolean {
  if (producto.status) return producto.status === "ACTIVE";
  if (producto.isActive !== undefined) return Boolean(producto.isActive);
  if (producto.activo !== undefined) return Boolean(producto.activo);
  return true;
}

export default function ProductosPage() {
  const { data: productos, isLoading, isError, refetch } = useProductos();
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filtros, setFiltros] = useState<ProductFiltersState>(FILTROS_INICIALES);

  // ESTADOS DEL MODAL Y ACCIONES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number | string;
    name: string;
    isActive: boolean;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const cambiarFiltro = useCallback(
    <K extends keyof ProductFiltersState>(
      campo: K,
      valor: ProductFiltersState[K]
    ) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  /**
   * Aplica búsqueda, filtros y orden en un solo lugar.
   *
   * Se ordena una sola vez sobre la lista completa y ambas vistas consumen el
   * resultado: así el catálogo y la tabla nunca muestran cosas distintas por
   * un efecto colateral del orden por defecto.
   */
  const productosFiltrados = useMemo(() => {
    if (!productos) return [];

    const texto = normalizar(filtros.busqueda.trim());

    const filtrados = (productos as Producto[]).filter((p: any) => {
      // Búsqueda por nombre.
      if (texto && !normalizar(String(p.name ?? "")).includes(texto)) {
        return false;
      }

      // Categoría.
      if (filtros.categoriaId) {
        const id = p.categoryId ?? p.category?.id;
        if (String(id) !== filtros.categoriaId) return false;
      }

      // Estado.
      if (filtros.estado === "activos" && !estaActivo(p)) return false;
      if (filtros.estado === "inactivos" && estaActivo(p)) return false;

      return true;
    });

    const orden = filtros.orden;
    const fecha = (p: any) => new Date(p.createdAt ?? 0).getTime();

    return [...filtrados].sort((a: any, b: any) => {
      switch (orden) {
        case "antiguos":
          return fecha(a) - fecha(b);
        case "stock-desc":
          return (b.stock ?? 0) - (a.stock ?? 0);
        case "stock-asc":
          return (a.stock ?? 0) - (b.stock ?? 0);
        case "nombre":
          return String(a.name ?? "").localeCompare(
            String(b.name ?? ""),
            undefined,
            { sensitivity: "base" }
          );
        case "recientes":
        default:
          return fecha(b) - fecha(a);
      }
    });
  }, [productos, filtros]);

  /** El catálogo muestra solo lo que está activo, igual que antes. */
  const productosActivos = useMemo(
    () => productosFiltrados.filter((p) => estaActivo(p)),
    [productosFiltrados]
  );

  /** La tabla sí incluye los inactivos: el vendedor necesita verlos para reactivarlos. */
  const productosTabla = productosFiltrados;

  // Abrir modal guardando datos del producto
  const handleOpenModal = (id: number | string, name: string, isActive: boolean) => {
    setSelectedProduct({ id, name, isActive });
    setIsModalOpen(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    if (processing) return;
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Ejecutar cambio de estado (Desactivar o Activar)
  const handleConfirmAction = async () => {
    if (!selectedProduct) return;

    try {
      setProcessing(true);

      if (selectedProduct.isActive) {
        // Desactivar / Eliminar
        await productosApi.eliminar(selectedProduct.id);
        toast.success("Producto desactivado correctamente");
      } else {
        // Reactivar / Activar
        const api = productosApi as any;
        if (typeof api.reactivar === "function") {
          await api.reactivar(selectedProduct.id);
        } else if (typeof api.actualizar === "function") {
          await api.actualizar(selectedProduct.id, { isActive: true });
        }
        toast.success("Producto activado correctamente");
      }

      refetch();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al cambiar el estado del producto:", error);
      const msg = error.response?.data?.message || "No se pudo realizar la acción";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock de Productos"
        subtitle="Explora y gestiona los productos del inventario."
        action={
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {/* Selector de vista */}
            <div
              role="group"
              aria-label="Modo de vista"
              className="flex items-center gap-1 rounded-xl border border-surface-border bg-brand-dark p-1"
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-brand-cyan font-semibold text-brand-darkest shadow-sm"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <LayoutGrid size={14} />
                <span>Catálogo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-brand-cyan font-semibold text-brand-darkest shadow-sm"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <List size={14} />
                <span>Tabla</span>
              </button>
            </div>

            <Link href="/products/add" className="sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus size={18} />
                <span>Nuevo Producto</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filtros: búsqueda por nombre, categoría, orden y estado */}
      {!isLoading && !isError && productos && productos.length > 0 && (
        <ProductFilters
          filtros={filtros}
          onCambio={cambiarFiltro}
          onLimpiar={limpiarFiltros}
          categorias={categorias ?? []}
          cargandoCategorias={cargandoCategorias}
          total={productos.length}
          visibles={
            viewMode === "grid" ? productosActivos.length : productosTabla.length
          }
        />
      )}

      {isLoading && (
        <div className="text-center py-12 text-slate-400">
          Cargando catálogo...
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-estado-rechazado">
          Error al obtener los productos.
        </div>
      )}

      {productos && productos.length === 0 && (
        <div className="text-center py-12 border border-dashed border-surface-border rounded-xl">
          <Package className="mx-auto text-slate-500 mb-2" size={40} />
          <p className="text-slate-400">No hay productos registrados.</p>
        </div>
      )}

      {/* Catálogo y tabla vacíos por filtros, no por falta de datos */}
      {productos && productos.length > 0 && productosFiltrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-surface-border rounded-xl">
          <Package className="mx-auto text-slate-500 mb-2" size={40} />
          <p className="text-slate-400">
            Ningún producto coincide con los filtros aplicados.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-3 text-xs font-semibold text-brand-cyan transition-colors hover:text-emerald-400"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Catálogo sin activos: hay productos, pero todos inactivos */}
      {viewMode === "grid" &&
        productos &&
        productos.length > 0 &&
        productosFiltrados.length > 0 &&
        productosActivos.length === 0 && (
          <div className="text-center py-12 border border-dashed border-surface-border rounded-xl">
            <Package className="mx-auto text-slate-500 mb-2" size={40} />
            <p className="text-slate-400">
              No hay productos activos. Cambia a la vista de tabla o activa
              alguno para verlo en el catálogo.
            </p>
          </div>
        )}

      {/* VISTA EN MODO CATÁLOGO (GRID) - SOLO PRODUCTOS ACTIVOS */}
      {viewMode === "grid" && productosActivos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosActivos.map((producto: any) => (
            <div
              key={producto.id}
              className="bg-brand-dark border border-surface-border rounded-xl overflow-hidden hover:border-surface-border transition-all flex flex-col"
            >
              <div className="h-48 bg-brand-darkest relative flex items-center justify-center overflow-hidden">
                {producto.imageUrl ? (
                  <img
                    src={producto.imageUrl}
                    alt={producto.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={48} className="text-slate-500" />
                )}

                {/* CÓDIGO DE PRODUCTO EN GRID */}
                {producto.code && (
                  <span className="absolute top-2 left-2 bg-brand-darkest/80 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-surface-border flex items-center gap-1 backdrop-blur-sm">
                    <Tag size={10} className="text-brand-cyan" />
                    {producto.code}
                  </span>
                )}

                {/* CATEGORÍA EN GRID */}
                {producto.category?.name && (
                  <span className="absolute top-2 right-2 bg-brand-dark/80 text-brand-cyan text-[10px] font-semibold px-2 py-1 rounded border border-surface-border backdrop-blur-sm">
                    {producto.category.name}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-100 line-clamp-1">
                    {producto.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {producto.description || "Sin descripción"}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-surface-border">
                  <span className="text-lg font-bold text-brand-cyan">
                    ${Number(producto.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Stock: {producto.stock}
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-t border-surface-border pt-2">
                  <Link href={`/products/edit/${producto.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit size={14} />
                      <span>Editar</span>
                    </Button>
                  </Link>

                  <Button
                    onClick={() => handleOpenModal(producto.id, producto.name, true)}
                    variant="outline"
                    size="sm"
                    className="w-full text-estado-rechazado hover:bg-estado-rechazado/10 hover:border-estado-rechazado/30"
                  >
                    <Trash2 size={14} />
                    <span>Desactivar</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA EN MODO TABLA - ACTIVOS E INACTIVOS, según el orden elegido */}
      {viewMode === "table" && productosTabla.length > 0 && (
        <div className="bg-brand-dark border border-surface-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-brand-darkest/60 text-slate-400 border-b border-surface-border uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Código</th>
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Categoría</th>
                  <th className="p-4 font-semibold">Precio</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {productosTabla.map((producto: any) => {
                  const isActive = estaActivo(producto);

                  return (
                    <tr
                      key={producto.id}
                      className={`hover:bg-surface-hover transition-colors ${
                        !isActive ? "opacity-60 bg-brand-darkest/40" : ""
                      }`}
                    >
                      {/* COLUMNA CÓDIGO */}
                      <td className="p-4">
                        <span className="font-mono text-[11px] bg-brand-darkest text-slate-300 px-2 py-1 rounded border border-surface-border">
                          {producto.code || "S/C"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">{producto.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {producto.description || "Sin descripción"}
                        </div>
                      </td>
                      <td className="p-4">
                        {producto.category?.name ? (
                          <span className="bg-brand-darkest text-brand-cyan text-[10px] font-semibold px-2 py-0.5 rounded border border-surface-border">
                            {producto.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-brand-cyan">
                        ${Number(producto.price).toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-300">
                        {producto.stock} unidades
                      </td>
                      <td className="p-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 bg-estado-validado/10 text-estado-validado border-estado-validado/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-estado-validado"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border-slate-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products/edit/${producto.id}`}>
                            <button
                              className="p-1.5 text-slate-300 hover:text-brand-cyan hover:bg-surface-hover rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                          </Link>

                          {isActive ? (
                            <button
                              onClick={() => handleOpenModal(producto.id, producto.name, true)}
                              className="p-1.5 text-estado-rechazado hover:text-estado-rechazado hover:bg-estado-rechazado/10 rounded-md transition-colors"
                              title="Desactivar"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(producto.id, producto.name, false)}
                              className="p-1.5 text-estado-validado hover:text-emerald-400 hover:bg-estado-validado/10 rounded-md transition-colors"
                              title="Reactivar"
                            >
                              <Power size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DINÁMICO */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={selectedProduct?.isActive ? "Confirmar Desactivación" : "Confirmar Activación"}
        description={
          selectedProduct?.isActive ? (
            <>
              ¿Estás seguro de que deseas desactivar el producto{" "}
              <span className="font-semibold text-slate-100">
                "{selectedProduct?.name}"
              </span>
              ? El producto dejará de estar disponible en el catálogo público.
            </>
          ) : (
            <>
              ¿Deseas activar nuevamente el producto{" "}
              <span className="font-semibold text-slate-100">
                "{selectedProduct?.name}"
              </span>
              ? Volverá a estar disponible en el sistema.
            </>
          )
        }
        confirmText={selectedProduct?.isActive ? "Sí, Desactivar" : "Sí, Activar"}
        cancelText="No, Cancelar"
        isLoading={processing}
        variant={selectedProduct?.isActive ? "danger" : undefined}
      />
    </div>
  );
}