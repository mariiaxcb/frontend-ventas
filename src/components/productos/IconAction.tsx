import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Variant = "default" | "danger" | "success" | "primary";

interface IconActionProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: number;
  /** false = usa el title nativo (útil dentro de tablas con overflow). */
  tooltip?: boolean;
  side?: "top" | "bottom";
}

const VARIANTS: Record<Variant, string> = {
  default:
    "border-surface-border text-slate-300 hover:bg-surface-hover hover:text-brand-cyan",
  danger:
    "border-estado-rechazado/30 text-estado-rechazado hover:bg-estado-rechazado/10",
  success:
    "border-estado-validado/30 text-estado-validado hover:bg-estado-validado/10",
  primary:
    "border-brand-cyan bg-brand-cyan text-brand-darkest hover:bg-brand-cyan/90",
};

export function IconAction({
  label,
  icon: Icon,
  href,
  onClick,
  variant = "default",
  size = 14,
  tooltip = true,
  side = "top",
}: IconActionProps) {
  const padding = size >= 18 ? "p-2.5" : "p-1.5";
  const className = `flex rounded-md border ${padding} transition-colors ${VARIANTS[variant]}`;
  const title = tooltip ? undefined : label;

  return (
    <div className="group/tip relative">
      {href ? (
        <Link href={href} aria-label={label} title={title} className={className}>
          <Icon size={size} />
        </Link>
      ) : (
        <button type="button" aria-label={label} title={title} onClick={onClick} className={className}>
          <Icon size={size} />
        </button>
      )}

      {tooltip && (
        <span
          className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-brand-darkest px-2 py-1 text-[10px] text-slate-200 opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 ${
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}