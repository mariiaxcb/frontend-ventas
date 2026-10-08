"use client";

import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/types/producto";

/** Opciones del desplegable de orden. */
export const ORDENES = [
  { value: "recientes", label: "Más recientes primero" },
  { value: "antiguos", label: "Más antiguos primero" },
  { value: "stock-desc", label: "Mayor stock" },
  { value: "stock-asc", label: "Menor stock" },
  { value: "nombre", label: "Nombre (A-Z)" },
] as const;

export type OrdenProductos = (typeof ORDENES)[number]["value"];

export const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
] as const;

export type EstadoFiltro = (typeof ESTADOS)[number]["value"];

export interface ProductFiltersState {
  busqueda: string;
  orden: OrdenProductos;
  categoriaId: string;
  estado: EstadoFiltro;
}

interface ProductFiltersProps {
  filtros: ProductFiltersState;
  onCambio: <K extends keyof ProductFiltersState>(
    campo: K,
    valor: ProductFiltersState[K]
  ) => void;
  onLimpiar: () => void;
  categorias: Categoria[];
  total: number;
  visibles: number;
  cargandoCategorias?: boolean;
}

/**
 * Barra de filtros del catálogo.
 *
 * El buscador filtra por nombre, como pidió el vendedor. Los desplegables usan
 * la lista completa de categorías que devuelve la API, para no dejar categorías
 * huérfanas cuando se crean productos nuevos.
 */
export function ProductFilters({
  filtros,
  onCambio,
  onLimpiar,
  categorias,
  total,
  visibles,
  cargandoCategorias,
}: ProductFiltersProps) {
  const hayFiltros =
    filtros.busqueda !== "" ||
    filtros.categoriaId !== "" ||
    filtros.estado !== "todos" ||
    filtros.orden !== "recientes";

  return (
    <div className="rounded-xl border border-surface-border bg-brand-dark p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Buscador por nombre */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          {/*
            `type="text"` y no `type="search"`: el segundo añade una "x" de
            limpieza nativa en el navegador, que se superpondría con el botón
            de abajo y aparecería duplicada.
          */}
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => onCambio("busqueda", e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos por nombre"
            className="w-full rounded-md border border-surface-border bg-brand-raised py-2.5 pl-9 pr-9 text-sm text-slate-100 transition-colors placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
          />
          {filtros.busqueda && (
            <button
              type="button"
              onClick={() => onCambio("busqueda", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-surface-hover hover:text-slate-100"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:flex-1">
          {/* Categoría */}
          <SelectFiltro
            etiqueta="Categoría"
            value={filtros.categoriaId}
            onChange={(v) => onCambio("categoriaId", v)}
            disabled={cargandoCategorias}
            opciones={[
              {
                value: "",
                label: cargandoCategorias ? "Cargando..." : "Todas",
              },
              ...categorias.map((c) => ({
                value: String(c.id),
                label: "name" in c ? String(c.name) : String(c.nombre),
              })),
            ]}
          />

          {/* Orden */}
          <SelectFiltro
            etiqueta="Ordenar por"
            value={filtros.orden}
            onChange={(v) => onCambio("orden", v as OrdenProductos)}
            opciones={ORDENES.map((o) => ({ value: o.value, label: o.label }))}
          />

          {/* Estado */}
          <SelectFiltro
            etiqueta="Estado"
            value={filtros.estado}
            onChange={(v) => onCambio("estado", v as EstadoFiltro)}
            opciones={ESTADOS.map((e) => ({ value: e.value, label: e.label }))}
          />
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-surface-border pt-3">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <SlidersHorizontal size={13} className="text-slate-500" />
          {hayFiltros ? (
            <>
              Mostrando{" "}
              <span className="font-semibold text-slate-200">{visibles}</span> de{" "}
              <span className="font-semibold text-slate-200">{total}</span>{" "}
              productos
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-200">{total}</span>{" "}
              productos en total
            </>
          )}
        </p>

        {hayFiltros && (
          <button
            type="button"
            onClick={onLimpiar}
            className="text-xs font-semibold text-brand-cyan transition-colors hover:text-emerald-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

interface SelectFiltroProps {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  opciones: { value: string; label: string }[];
  disabled?: boolean;
}

/**
 * Desplegable con etiqueta visible.
 *
 * Se implementa con `select` nativo en vez de un componente a medida: en
 * escritorio abre el menú del sistema (más rápido de usar) y en móvil se
 * convierte en el selector de rueda de Android e iOS.
 */
function SelectFiltro({ etiqueta, value, onChange, opciones, disabled }: SelectFiltroProps) {
  return (
    <label className="relative block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={etiqueta}
          className={cn(
            "w-full appearance-none rounded-md border border-surface-border bg-brand-raised py-2.5 pl-3 pr-9 text-sm text-slate-100 transition-colors focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          {opciones.map((o) => (
            <option key={o.value} value={o.value} className="bg-brand-dark">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}