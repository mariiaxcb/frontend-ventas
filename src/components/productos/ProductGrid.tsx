"use client";

import { Package } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Producto } from "@/types/producto";

interface ProductGridProps {
  productos: Producto[];
  isLoading?: boolean;
  onEdit?: (producto: Producto) => void;
  onDelete?: (producto: Producto) => void;
  onAdd?: () => void;
}

export function ProductGrid({
  productos,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hay productos"
        description="Agrega tu primer producto para comenzar a vender"
        action={onAdd ? { label: "Agregar Producto", onClick: onAdd } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
