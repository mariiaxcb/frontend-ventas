"use client";

import { AlertTriangle, Info, CheckCircle, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ModalVariant = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: ModalVariant;
  icon?: LucideIcon;
}

const variantStyles: Record<
  ModalVariant,
  { iconBg: string; iconColor: string; buttonBg: string; defaultIcon: LucideIcon }
> = {
  danger: {
    iconBg: "bg-estado-rechazado/10 border-estado-rechazado/30",
    iconColor: "text-estado-rechazado",
    buttonBg: "bg-estado-rechazado hover:bg-red-600 text-slate-100",
    defaultIcon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-estado-pendiente/10 border-estado-pendiente/30",
    iconColor: "text-estado-pendiente",
    buttonBg: "bg-estado-pendiente hover:bg-amber-500 text-slate-100",
    defaultIcon: AlertTriangle,
  },
  info: {
    iconBg: "bg-brand-primary/15 border-brand-primary/30",
    iconColor: "text-brand-light",
    buttonBg: "bg-brand-primary hover:bg-brand-light text-slate-100 font-semibold",
    defaultIcon: Info,
  },
  success: {
    iconBg: "bg-estado-validado/10 border-estado-validado/30",
    iconColor: "text-estado-validado",
    buttonBg: "bg-estado-validado hover:bg-emerald-500 text-slate-100",
    defaultIcon: CheckCircle,
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  variant = "danger",
  icon,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const style = variantStyles[variant];
  const IconComponent = icon || style.defaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-dark border border-surface-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 border rounded-lg ${style.iconBg} ${style.iconColor}`}>
            <IconComponent size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-poppins">{title}</h2>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed">{description}</div>

        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs flex items-center gap-2 ${style.buttonBg}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}