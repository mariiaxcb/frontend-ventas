import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "danger";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 shadow-sm transition-all duration-200",
        variant === "default" && "border-brand-primary/20 bg-brand-dark",
        variant === "highlight" && "border-brand-cyan/30 bg-brand-dark shadow-brand-cyan/5",
        variant === "danger" && "border-estado-rechazado/30 bg-brand-dark",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="font-poppins text-lg font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("text-slate-200", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center justify-end gap-3 border-t border-brand-primary/10 pt-4", className)}>
      {children}
    </div>
  );
}
