"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { PostulanteEvento } from "@/types/socket";

export function ListaPostulantes() {
  const [postulantes, setPostulantes] = useState<PostulanteEvento[]>([]);

  useSocket({
    onPostulante: (data) => setPostulantes((prev) => [data, ...prev].slice(0, 50)),
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-brand-primary/20 bg-brand-dark">
      <div className="border-b border-brand-primary/10 px-4 py-3 font-poppins font-medium uppercase tracking-wider text-xs text-brand-light bg-brand-darkest/40">
        Postulantes a productos
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {postulantes.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Sin postulaciones aún.</p>
        )}
        {postulantes.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-brand-darkest/50 border border-brand-primary/10 px-3 py-2 text-sm"
          >
            <span className="font-poppins font-medium text-brand-cyan">{p.usuarioTiktok}</span>
            <span className="text-xs font-inter font-medium text-slate-400">
              producto {p.productoId}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
