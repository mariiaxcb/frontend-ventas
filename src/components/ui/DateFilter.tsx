"use client";

import { CalendarRange } from "lucide-react";
import {
  PERIODOS_FILTRO,
  rangoPeriodo,
  normalizarTexto,
  type PeriodoFiltro,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

export type OrdenCronologico = "recientes" | "antiguos";

const ORDENES: { value: OrdenCronologico; label: string }[] = [
  { value: "recientes", label: "Más recientes primero" },
  { value: "antiguos", label: "Más antiguos primero" },
];

interface DateFilterProps {
  periodo: PeriodoFiltro;
  orden: OrdenCronologico;
  busqueda: string;
  placeholderBusqueda: string;
  etiquetaBusqueda: string;
  onPeriodo: (valor: PeriodoFiltro) => void;
  onOrden: (valor: OrdenCronologico) => void;
  onBusqueda: (valor: string) => void;
  total: number;
  visibles: number;
}

/**
 * Barra de filtros por texto y fecha, compartida por Reportes y Pedidos.
 *
 * Ambas pantallas necesitaban exactamente lo mismo (buscar por nombre, ordenar
 * por fecha y acotar por periodo), así que vive en un solo componente en vez de
 * duplicarse. Cada pantalla le pasa su propio placeholder y qué campo busca.
 */
export function DateFilter({
  periodo,
  orden,
  busqueda,
  placeholderBusqueda,
  etiquetaBusqueda,
  onPeriodo,
  onOrden,
  onBusqueda,
  total,
  visibles,
}: DateFilterProps) {
  const hayFiltros =
    busqueda.trim() !== "" || periodo !== "todo" || orden !== "recientes";

  return (
    <div className="rounded-xl border border-surface-border bg-brand-dark p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Buscador */}
        <div className="relative flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            placeholder={placeholderBusqueda}
            aria-label={etiquetaBusqueda}
            className="w-full rounded-md border border-surface-border bg-brand-raised py-2.5 pl-9 pr-3 text-sm text-slate-100 transition-colors placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
          />
          <CalendarRange
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Periodo */}
        <div
          role="group"
          aria-label="Filtrar por fecha"
          className="flex flex-wrap items-center gap-1 rounded-md border border-surface-border bg-brand-raised p-1"
        >
          {PERIODOS_FILTRO.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPeriodo(p.value)}
              aria-pressed={periodo === p.value}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                periodo === p.value
                  ? "bg-brand-cyan font-semibold text-brand-darkest"
                  : "text-slate-400 hover:text-slate-100"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Orden */}
        <label className="block lg:w-52">
          <span className="sr-only">Ordenar por fecha</span>
          <select
            value={orden}
            onChange={(e) => onOrden(e.target.value as OrdenCronologico)}
            aria-label="Ordenar por fecha"
            className="w-full appearance-none rounded-md border border-surface-border bg-brand-raised px-3 py-2.5 text-sm text-slate-100 transition-colors focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
          >
            {ORDENES.map((o) => (
              <option key={o.value} value={o.value} className="bg-brand-dark">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hayFiltros && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-surface-border pt-3">
          <p className="text-xs text-slate-400">
            Mostrando{" "}
            <span className="font-semibold text-slate-200">{visibles}</span> de{" "}
            <span className="font-semibold text-slate-200">{total}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              onBusqueda("");
              onPeriodo("todo");
              onOrden("recientes");
            }}
            className="text-xs font-semibold text-brand-cyan transition-colors hover:text-emerald-400"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

/** Aplica búsqueda, periodo y orden sobre una lista con `fecha`. */
export function aplicarFiltros<T>(
  items: T[],
  opciones: {
    busqueda: string;
    periodo: PeriodoFiltro;
    orden: OrdenCronologico;
    /** Campos donde se busca el texto. */
    campos: (item: T) => (string | null | undefined)[];
    /** Fecha usada para filtrar y ordenar. */
    fecha: (item: T) => string | Date | null | undefined;
  }
): T[] {
  const texto = normalizarTexto(opciones.busqueda);
  const { desde, hasta } = rangoPeriodo(opciones.periodo);

  const filtrados = items.filter((item) => {
    if (texto) {
      const coincide = opciones
        .campos(item)
        .some((campo) =>
          normalizarTexto(String(campo ?? "")).includes(texto)
        );
      if (!coincide) return false;
    }

    const valorFecha = opciones.fecha(item);
    if (!valorFecha) return opciones.periodo === "todo";

    const fecha = new Date(valorFecha).getTime();
    return fecha >= desde.getTime() && fecha <= hasta.getTime();
  });

  return [...filtrados].sort((a, b) => {
    const fa = new Date(opciones.fecha(a) ?? 0).getTime();
    const fb = new Date(opciones.fecha(b) ?? 0).getTime();
    return opciones.orden === "antiguos" ? fa - fb : fb - fa;
  });
}