import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-poppins font-bold tracking-[0.5px] uppercase transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variant === "primary" && "bg-brand-primary text-white hover:bg-brand-light shadow-md hover:shadow-brand-light/20",
          variant === "secondary" && "bg-brand-cyan text-brand-darkest hover:bg-white shadow-md hover:shadow-brand-cyan/20",
          variant === "outline" && "border border-brand-light/30 text-brand-light hover:bg-brand-dark hover:border-brand-light/60",
          variant === "danger" && "bg-estado-rechazado text-white hover:bg-red-600 shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
