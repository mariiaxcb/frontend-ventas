import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type MetricTone = "brand" | "success" | "warning" | "danger";

interface LiveSummaryMetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: MetricTone;
}

/**
 * Tonos de las metricas. "Dinero generado" y "Ventas" usan el verde de la
 * paleta para que el vendedor ubique al instante cuanto entro.
 */
const TONE_STYLES: Record<MetricTone, { icon: string; value: string }> = {
  brand: {
    icon: "bg-brand-primary/15 text-brand-light",
    value: "text-brand-light",
  },
  success: {
    icon: "bg-estado-validado/10 text-estado-validado",
    value: "text-estado-validado",
  },
  warning: {
    icon: "bg-estado-pendiente/10 text-estado-pendiente",
    value: "text-estado-pendiente",
  },
  danger: {
    icon: "bg-estado-rechazado/10 text-estado-rechazado",
    value: "text-estado-rechazado",
  },
};

/** Métrica individual del resumen de un live. */
export function LiveSummaryMetric({
  title,
  value,
  icon: Icon,
  hint,
  tone = "brand",
}: LiveSummaryMetricProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Card className="flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {title}
        </p>
        <div className={cn("rounded-lg p-2", styles.icon)}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className={cn("font-poppins text-2xl font-bold", styles.value)}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}