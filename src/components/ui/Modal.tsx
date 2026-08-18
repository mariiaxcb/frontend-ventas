"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  abierto: boolean;
  onClose: () => void;
  titulo?: string;
  children: ReactNode;
}

export function Modal({ abierto, onClose, titulo, children }: ModalProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-darkest/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg bg-brand-dark border border-brand-light/20 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center justify-between">
          {titulo && <h2 className="text-xl font-poppins font-semibold text-brand-cyan">{titulo}</h2>}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-brand-darkest hover:text-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
