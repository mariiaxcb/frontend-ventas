import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/products"
        aria-label="Volver"
        className="rounded-lg border border-surface-border bg-brand-dark p-2 text-slate-400 hover:text-slate-100"
      >
        <ArrowLeft size={18} />
      </Link>
      <div>
        <h1 className="font-poppins text-2xl font-bold text-brand-cyan">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}