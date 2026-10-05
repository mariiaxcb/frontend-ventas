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

const TONE_STYLES: Record<MetricTone, { icon: string; value: string }> = {
  brand: { icon: "bg-brand-primary/10 text-brand-light", value: "text-brand-cyan" },
  success: { icon: "bg-emerald-500/10 text-emerald-400", value: "text-emerald-400" },
  warning: { icon: "bg-amber-500/10 text-amber-400", value: "text-amber-400" },
  danger: { icon: "bg-red-500/10 text-red-400", value: "text-red-400" },
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