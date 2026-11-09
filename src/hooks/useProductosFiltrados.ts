"use client";

import { useState, useMemo, useCallback } from "react";
import type { ProductFiltersState } from "@/components/productos/ProductFilters";
import type { Producto } from "@/types/producto";
import { FILTROS_INICIALES, estaActivo, filtrarYOrdenar } from "@/lib/productos";

export function useProductosFiltrados(productos?: Producto[]) {
  const [filtros, setFiltros] = useState<ProductFiltersState>(FILTROS_INICIALES);

  const cambiarFiltro = useCallback(
    <K extends keyof ProductFiltersState>(campo: K, valor: ProductFiltersState[K]) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  const productosFiltrados = useMemo(
    () => (productos ? filtrarYOrdenar(productos, filtros) : []),
    [productos, filtros]
  );

  const productosActivos = useMemo(
    () => productosFiltrados.filter((p) => estaActivo(p)),
    [productosFiltrados]
  );

  return { filtros, cambiarFiltro, limpiarFiltros, productosFiltrados, productosActivos };
}