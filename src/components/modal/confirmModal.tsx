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
    iconBg: "bg-red-950/50 border-red-900/50",
    iconColor: "text-red-400",
    buttonBg: "bg-red-600 hover:bg-red-700 text-white",
    defaultIcon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-amber-950/50 border-amber-900/50",
    iconColor: "text-amber-400",
    buttonBg: "bg-amber-600 hover:bg-amber-700 text-white",
    defaultIcon: AlertTriangle,
  },
  info: {
    iconBg: "bg-cyan-950/50 border-cyan-900/50",
    iconColor: "text-brand-cyan",
    buttonBg: "bg-brand-cyan hover:bg-cyan-500 text-slate-950 font-semibold",
    defaultIcon: Info,
  },
  success: {
    iconBg: "bg-emerald-950/50 border-emerald-900/50",
    iconColor: "text-emerald-400",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 border rounded-lg ${style.iconBg} ${style.iconColor}`}>
            <IconComponent size={24} />
          </div>
          <h2 className="text-lg font-bold text-white font-poppins">{title}</h2>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed">{description}</div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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