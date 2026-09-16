"use client";

import React from "react";
import type { ChatMensajeEvento } from "@/types/socket";

interface ChatStreamProps {
  comentarios?: any[];
  onPostular?: (mensaje: ChatMensajeEvento) => void;
  onUpdateCount?: (count: number) => void;
}

export function ChatStream({ comentarios = [], onPostular }: ChatStreamProps) {
  const mensajes: ChatMensajeEvento[] = comentarios.map((c) => {
    // Priorizar Nickname si no es anónimo
    const nombreAMostrar =
      c.nickname && c.nickname !== "Usuario_Anonimo"
        ? c.nickname
        : c.usuario && c.usuario !== "Usuario_Anonimo"
        ? c.usuario
        : c.uniqueId || "Usuario";

    return {
      usuarioTiktok: nombreAMostrar,
      mensaje: c.comentario || c.comment || c.mensaje || "",
      timestamp: c.fecha || c.timestamp || new Date().toISOString(),
    };
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/40">
        <span className="font-poppins font-medium uppercase tracking-wider text-xs text-slate-200">
          Chat filtrado de la transmisión
        </span>
        <span className="text-xs text-slate-400 font-inter">
          {mensajes.length} msjs
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {mensajes.length === 0 ? (
          <p className="text-sm text-slate-400 font-inter">
            Esperando mensajes del live…
          </p>
        ) : (
          mensajes.map((m, i) => {
            const uniqueKey = `${m.usuarioTiktok}-${m.timestamp}-${i}`;

            return (
              <div
                key={uniqueKey}
                className="group flex items-center justify-between rounded p-1.5 transition-colors hover:bg-slate-800/50"
              >
                <div className="text-sm font-inter pr-2">
                  <span className="font-semibold text-brand-cyan font-poppins">
                    @{m.usuarioTiktok}:{" "}
                  </span>
                  <span className="text-slate-200">{m.mensaje}</span>
                </div>

                {onPostular && (
                  <button
                    type="button"
                    onClick={() => onPostular(m)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/20 hover:bg-cyan-500/30 text-brand-cyan text-xs px-2 py-1 rounded font-poppins font-medium cursor-pointer"
                  >
                    Postular
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}