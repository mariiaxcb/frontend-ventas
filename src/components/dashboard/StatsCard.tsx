import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card variant="default" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-400">{title}</p>
          <p className="font-poppins text-2xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% vs. periodo anterior
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-lg p-3",
            variant === "default" && "bg-brand-primary/10 text-brand-light",
            variant === "success" && "bg-emerald-500/10 text-emerald-400",
            variant === "warning" && "bg-amber-500/10 text-amber-400",
            variant === "danger" && "bg-red-500/10 text-red-400"
          )}
        >
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
}
