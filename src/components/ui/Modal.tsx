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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          {titulo && <h2 className="text-lg font-semibold">{titulo}</h2>}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
