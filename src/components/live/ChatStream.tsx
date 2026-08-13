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
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">
        Chat en vivo
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {mensajes.length === 0 && (
          <p className="text-sm text-gray-400">Esperando mensajes del live…</p>
        )}
        {mensajes.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold text-primary">{m.usuarioTiktok}: </span>
            <span className="text-gray-700">{m.mensaje}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
