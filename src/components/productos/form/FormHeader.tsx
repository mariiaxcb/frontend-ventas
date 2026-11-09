import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 w-full py-2">
      {/* 1. Botón Volver a la izquierda */}
      <Link
        href="/products"
        aria-label="Volver"
        className="rounded-lg border border-surface-border bg-brand-dark p-2 text-slate-400 hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={18} />
      </Link>

      {/* 2. Título y Subtítulo perfectamente centrados */}
      <div className="text-center">
        <h1 className="font-poppins text-2xl font-bold text-brand-cyan">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* 3. Espaciador fantasma para equilibrar el botón de la izquierda */}
      <div className="w-9" aria-hidden="true" />
    </div>
  );
}