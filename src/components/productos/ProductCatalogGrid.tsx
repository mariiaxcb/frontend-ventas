import { ProductCatalogCard } from "./ProductCatalogCard";

interface ProductCatalogGridProps {
  productos: any[];
  onDesactivar: (producto: any) => void;
}

export function ProductCatalogGrid({ productos, onDesactivar }: ProductCatalogGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {productos.map((producto) => (
        <ProductCatalogCard
          key={producto.id}
          producto={producto}
          onDesactivar={onDesactivar}
        />
      ))}
    </div>
  );
}