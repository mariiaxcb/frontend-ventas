import {
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Tono = "brand" | "success" | "warning" | "info";

const TONOS: Record<Tono, string> = {
  brand: "bg-brand-primary/15 text-brand-light",
  success: "bg-estado-validado/15 text-estado-validado",
  warning: "bg-estado-pendiente/15 text-estado-pendiente",
  info: "bg-estado-highlight/15 text-estado-highlight",
};

interface ReportKpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tono;
  /**
   * Variación porcentual contra el periodo anterior.
   * `undefined` oculta la comparación; `null` indica que no hay base previa.
   */
  delta?: number | null;
}

function formatearDelta(delta: number): string {
  const valor = Math.abs(delta);
  const texto = new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: valor >= 10 ? 0 : 1,
  }).format(valor);
  return `${delta > 0 ? "+" : "-"}${texto}%`;
}

export function ReportKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  delta,
}: ReportKpiCardProps) {
  const sinCambios = delta === 0;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <span className={cn("rounded-lg p-2", TONOS[tone])}>
          <Icon size={18} />
        </span>
      </div>

      <p className="font-poppins text-2xl font-bold text-slate-100">{value}</p>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              sinCambios && "bg-slate-500/10 text-slate-400",
              delta !== null &&
                !sinCambios &&
                delta > 0 &&
                "bg-estado-validado/10 text-estado-validado",
              delta !== null &&
                !sinCambios &&
                delta < 0 &&
                "bg-estado-rechazado/10 text-estado-rechazado",
              delta === null && "bg-slate-500/10 text-slate-400"
            )}
          >
            {delta === null ? (
              "Sin base previa"
            ) : sinCambios ? (
              <>
                <Minus size={12} /> Sin cambios
              </>
            ) : delta > 0 ? (
              <>
                <TrendingUp size={12} /> {formatearDelta(delta)}
              </>
            ) : (
              <>
                <TrendingDown size={12} /> {formatearDelta(delta)}
              </>
            )}
          </span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </Card>
  );
}
