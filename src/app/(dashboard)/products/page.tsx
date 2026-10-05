"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Package, Edit, Trash2, LayoutGrid, List, Power, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/modal/confirmModal";
import { useProductos } from "@/hooks/useProductos";
import { productosApi } from "@/services/productos.api";

export default function ProductosPage() {
  const { data: productos, isLoading, isError, refetch } = useProductos();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // ESTADOS DEL MODAL Y ACCIONES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number | string;
    name: string;
    isActive: boolean;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Filtrar solo activos para el Catálogo (Grid)
  const productosActivos = useMemo(() => {
    if (!productos) return [];
    return productos.filter((p: any) => p.isActive ?? p.activo ?? true);
  }, [productos]);

  // Ordenar alfabéticamente A-Z todos los productos para la Tabla (Activos e Inactivos)
  const productosTabla = useMemo(() => {
    if (!productos) return [];
    return [...productos].sort((a: any, b: any) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [productos]);

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
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan">
            Stock de Productos
          </h1>
          <p className="text-xs text-slate-400">
            Explora y gestiona los productos del inventario.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* BOTÓN DESLIZANTE DE MODO DE VISTA */}
          <div className="bg-brand-dark border border-surface-border p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-brand-cyan text-brand-darkest font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <LayoutGrid size={14} />
              <span>Catálogo</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-brand-cyan text-brand-darkest font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <List size={14} />
              <span>Tabla</span>
            </button>
          </div>

          <Link href="/products/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              <span>Nuevo Producto</span>
            </Button>
          </Link>
        </div>
      </div>

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

      {/* VISTA EN MODO CATÁLOGO (GRID) - SOLO PRODUCTOS ACTIVOS */}
      {viewMode === "grid" && (
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

      {/* VISTA EN MODO TABLA - ACTIVOS E INACTIVOS ORDENADOS ALFABÉTICAMENTE */}
      {viewMode === "table" && (
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
                  const isActive = producto.isActive ?? producto.activo ?? true;

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