"use client";

import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ChatMensajeEvento } from "@/types/socket";

interface LiveChatPanelProps {
  mensajes: ChatMensajeEvento[];
}

export function LiveChatPanel({ mensajes }: LiveChatPanelProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-brand-cyan" />
          <h3 className="font-poppins text-sm font-semibold text-slate-100">
            Chat del Live (Filtrado)
          </h3>
        </div>
        <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-xs font-medium text-brand-light">
          {mensajes.length} mensajes
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {mensajes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Esperando mensajes del live...
          </div>
        ) : (
          mensajes.map((mensaje, index) => (
            <div
              key={`${mensaje.usuarioTiktok}-${mensaje.timestamp}-${index}`}
              className="rounded-lg border border-surface-border bg-brand-darkest/30 p-2"
            >
              <div className="flex items-start gap-2">
                <span className="font-poppins text-sm font-semibold text-brand-cyan">
                  @{mensaje.usuarioTiktok}
                </span>
                <span className="text-sm text-slate-300">{mensaje.mensaje}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
