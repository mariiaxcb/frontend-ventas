import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-poppins font-bold tracking-[0.5px] uppercase transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "sm" && "px-3 py-1.5 text-xs",
          variant === "primary" &&
            "bg-brand-primary text-slate-100 shadow-md hover:bg-brand-light hover:shadow-brand-primary/25",
          variant === "secondary" &&
            "bg-brand-cyan text-brand-darkest shadow-md hover:bg-estado-validado hover:shadow-brand-cyan/25",
          variant === "outline" &&
            "border border-surface-border bg-transparent text-slate-200 hover:border-brand-primary hover:bg-brand-primary/15 hover:text-slate-100",
          variant === "danger" &&
            "bg-estado-rechazado text-slate-100 shadow-md hover:bg-red-500",
          variant === "ghost" &&
            "bg-transparent text-slate-400 hover:bg-surface-hover hover:text-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";