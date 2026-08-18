"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { ChatMensajeEvento } from "@/types/socket";

export function ChatStream() {
  const [mensajes, setMensajes] = useState<ChatMensajeEvento[]>([]);

  useSocket({
    onChatMensaje: (data) => setMensajes((prev) => [...prev.slice(-99), data]),
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-brand-primary/20 bg-brand-dark">
      <div className="border-b border-brand-primary/10 px-4 py-3 font-poppins font-medium uppercase tracking-wider text-xs text-brand-light bg-brand-darkest/40">
        Chat en vivo
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {mensajes.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Esperando mensajes del live…</p>
        )}
        {mensajes.map((m, i) => (
          <div key={i} className="text-sm font-inter">
            <span className="font-semibold text-brand-cyan font-poppins">{m.usuarioTiktok}: </span>
            <span className="text-slate-200">{m.mensaje}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
