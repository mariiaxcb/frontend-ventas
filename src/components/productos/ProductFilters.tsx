"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { EstadoProducto } from "@/types/producto";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: EstadoProducto | "";
  onStatusChange: (value: EstadoProducto | "") => void;
  categories: { id: string; nombre: string }[];
}

export function ProductFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-surface-border bg-brand-dark p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-md border border-surface-border bg-brand-darkest px-3 py-2 text-sm text-slate-200 focus:border-brand-cyan focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as EstadoProducto | "")}
          className="rounded-md border border-surface-border bg-brand-darkest px-3 py-2 text-sm text-slate-200 focus:border-brand-cyan focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="OUT_OF_STOCK">Sin stock</option>
        </select>

        {(search || selectedCategory || selectedStatus) && (
          <Button
            variant="ghost"
            onClick={() => {
              onSearchChange("");
              onCategoryChange("");
              onStatusChange("");
            }}
            className="text-xs"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
