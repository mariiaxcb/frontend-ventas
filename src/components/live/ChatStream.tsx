"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { ChatMensajeEvento } from "@/types/socket";

interface ChatStreamProps {
  onPostular?: (mensaje: ChatMensajeEvento) => void;
  onUpdateCount?: (count: number) => void;
}

export function ChatStream({ onPostular, onUpdateCount }: ChatStreamProps) {
  const [mensajes, setMensajes] = useState<ChatMensajeEvento[]>([]);

  useSocket({
    onChatMensaje: (data) => {
      setMensajes((prev) => {
        const nuevosMensajes = [...prev.slice(-99), data];
        if (onUpdateCount) onUpdateCount(nuevosMensajes.length);
        return nuevosMensajes;
      });
    },
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-brand-primary/20 bg-brand-dark">
      <div className="flex items-center justify-between border-b border-brand-primary/10 px-4 py-3 bg-brand-darkest/40">
        <span className="font-poppins font-medium uppercase tracking-wider text-xs text-brand-light">
          Chat en vivo
        </span>
        <span className="text-xs text-slate-400 font-inter">
          {mensajes.length} msjs
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {mensajes.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Esperando mensajes del live…</p>
        )}

        {mensajes.map((m, i) => (
          <div 
            key={i} 
            className="group flex items-center justify-between rounded p-1.5 transition-colors hover:bg-brand-primary/10"
          >
            <div className="text-sm font-inter pr-2">
              <span className="font-semibold text-brand-cyan font-poppins">
                @{m.usuarioTiktok}:{" "}
              </span>
              <span className="text-slate-200">{m.mensaje}</span>
            </div>

            {onPostular && (
              <button
                onClick={() => onPostular(m)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan text-xs px-2 py-1 rounded font-poppins font-medium"
              >
                Postular
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}