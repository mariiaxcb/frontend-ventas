"use client";

import { useState } from "react";
import { ChatStream } from "@/components/live/ChatStream";
import { ListaPostulantes } from "@/components/live/ListaPostulantes";

export default function LivePage() {
  const [comentariosEnRAM, setComentariosEnRAM] = useState<number>(0);
  const [ventasEnBD, setVentasEnBD] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Cabecera con título y estado del Live */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
            Monitor en tiempo real de TikTok Live
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Captura de comentarios en memoria RAM y confirmación manual de pedidos a la BD.
          </p>
        </div>

        {/* Indicadores de estado y contadores */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">En vivo</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            En cola (RAM): <span className="font-bold text-brand-cyan">{comentariosEnRAM}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            Ventas (BD): <span className="font-bold text-emerald-400">{ventasEnBD}</span>
          </div>
        </div>
      </div>

      {/* Grid principal con ChatStream y ListaPostulantes */}
      <div className="grid h-[calc(80vh-4rem)] grid-cols-1 gap-6 lg:grid-cols-2">
        <ChatStream onUpdateCount={(count) => setComentariosEnRAM(count)} />
        <ListaPostulantes onVentaConfirmada={() => setVentasEnBD((prev) => prev + 1)} />
      </div>
    </div>
  );
}