import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          className={cn(
            "rounded-md border border-brand-primary/30 bg-brand-dark px-3 py-2.5 text-sm text-slate-100 placeholder-slate-400 font-inter focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all",
            error && "border-estado-rechazado focus:ring-estado-rechazado/20",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-estado-rechazado">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
