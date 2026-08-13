"use client";

import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTipo = "exito" | "error" | "info";

interface ToastProps {
  tipo: ToastTipo;
  mensaje: string;
  onClose?: () => void;
}

const iconos = {
  exito: CheckCircle2,
  error: XCircle,
  info: Info,
};

const estilos: Record<ToastTipo, string> = {
  exito: "bg-estado-validado/10 text-estado-validado border-estado-validado/30",
  error: "bg-estado-rechazado/10 text-estado-rechazado border-estado-rechazado/30",
  info: "bg-blue-50 text-blue-600 border-blue-200",
};

export function Toast({ tipo, mensaje, onClose }: ToastProps) {
  const Icono = iconos[tipo];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-4 py-3 text-sm shadow-sm",
        estilos[tipo]
      )}
      onClick={onClose}
      role="alert"
    >
      <Icono size={16} />
      <span>{mensaje}</span>
    </div>
  );
}
