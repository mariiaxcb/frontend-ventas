"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PERIODOS_REPORTE,
  type PeriodoReporte,
} from "@/lib/reportes";
import { cn } from "@/lib/utils";

interface ReportPeriodPickerProps {
  periodo: PeriodoReporte;
  etiqueta: string;
  onChange: (periodo: PeriodoReporte) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export function ReportPeriodPicker({
  periodo,
  etiqueta,
  onChange,
  onPrev,
  onNext,
  canNext,
}: ReportPeriodPickerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-brand-dark p-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Periodo del reporte"
        className="flex items-center gap-1 rounded-md border border-surface-border bg-brand-raised p-1"
      >
        {PERIODOS_REPORTE.map((opcion) => {
          const activo = opcion.value === periodo;
          return (
            <button
              key={opcion.value}
              type="button"
              onClick={() => onChange(opcion.value)}
              aria-pressed={activo}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold transition-colors",
                activo
                  ? "bg-brand-primary text-slate-100"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              )}
            >
              {opcion.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onPrev}
          aria-label="Periodo anterior"
        >
          <ChevronLeft size={16} />
        </Button>

        <span className="flex min-w-0 items-center gap-2 px-1 text-xs font-medium text-slate-200">
          <CalendarDays size={14} className="shrink-0 text-brand-cyan" />
          <span className="truncate">{etiqueta}</span>
        </span>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Periodo siguiente"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
