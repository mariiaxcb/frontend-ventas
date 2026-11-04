import type { Producto } from "@/types/producto";
import type { ProductFiltersState } from "@/components/productos/ProductFilters";

export const FILTROS_INICIALES: ProductFiltersState = {
  busqueda: "",
  orden: "recientes",
  categoriaId: "",
  estado: "todos",
};

export const formatoBs = (valor: number | string) =>
  `Bs ${Number(valor).toFixed(2)}`;

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function estaActivo(producto: any): boolean {
  if (producto.status) return producto.status === "ACTIVE";
  if (producto.isActive !== undefined) return Boolean(producto.isActive);
  if (producto.activo !== undefined) return Boolean(producto.activo);
  return true;
}

export function filtrarYOrdenar(
  productos: Producto[],
  filtros: ProductFiltersState
): Producto[] {
  const texto = normalizar(filtros.busqueda.trim());

  const filtrados = productos.filter((p: any) => {
    if (texto && !normalizar(String(p.name ?? "")).includes(texto)) return false;

    if (filtros.categoriaId) {
      const id = p.categoryId ?? p.category?.id;
      if (String(id) !== filtros.categoriaId) return false;
    }

    if (filtros.estado === "activos" && !estaActivo(p)) return false;
    if (filtros.estado === "inactivos" && estaActivo(p)) return false;

    return true;
  });

  const fecha = (p: any) => new Date(p.createdAt ?? 0).getTime();

  return [...filtrados].sort((a: any, b: any) => {
    switch (filtros.orden) {
      case "antiguos":
        return fecha(a) - fecha(b);
      case "stock-desc":
        return (b.stock ?? 0) - (a.stock ?? 0);
      case "stock-asc":
        return (a.stock ?? 0) - (b.stock ?? 0);
      case "nombre":
        return String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
          sensitivity: "base",
        });
      case "recientes":
      default:
        return fecha(b) - fecha(a);
    }
  });
}