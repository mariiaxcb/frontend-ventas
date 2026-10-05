"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Página actual (base 1). */
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  /** Elementos por página, para mostrar el rango. */
  porPagina: number;
  onCambio: (pagina: number) => void;
  className?: string;
}

/**
 * Paginación para listados largos. Además de los botones, muestra el rango
 * visible para que el vendedor sepa dónde está dentro del total.
 */
export function Pagination({
  pagina,
  totalPaginas,
  totalElementos,
  porPagina,
  onCambio,
  className,
}: PaginationProps) {
  if (totalElementos === 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, totalElementos);

  /** Ventana de páginas alrededor de la actual, con puntillos si hace falta. */
  const paginas: (number | "…")[] = [];
  const ventana = 1;

  for (let i = 1; i <= totalPaginas; i++) {
    const visible =
      i === 1 || i === totalPaginas || Math.abs(i - pagina) <= ventana;

    if (visible) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== "…") {
      paginas.push("…");
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className
      )}
    >
      <p className="text-xs text-slate-400">
        Mostrando <span className="font-semibold text-slate-200">{desde}</span>–
        <span className="font-semibold text-slate-200">{hasta}</span> de{" "}
        <span className="font-semibold text-slate-200">{totalElementos}</span>
      </p>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onCambio(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </Button>

          {paginas.map((p, index) =>
            p === "…" ? (
              <span
                key={`gap-${index}`}
                className="px-1.5 text-xs text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onCambio(p)}
                aria-current={p === pagina ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-md px-2 text-xs font-medium transition-colors",
                  p === pagina
                    ? "bg-brand-primary text-slate-100"
                    : "text-slate-400 hover:bg-brand-primary/15 hover:text-slate-200"
                )}
              >
                {p}
              </button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onCambio(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}