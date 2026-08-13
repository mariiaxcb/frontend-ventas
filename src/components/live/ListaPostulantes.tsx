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
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">
        Postulantes a productos
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {postulantes.length === 0 && (
          <p className="text-sm text-gray-400">Sin postulaciones aún.</p>
        )}
        {postulantes.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
          >
            <span className="font-medium">{p.usuarioTiktok}</span>
            <span className="text-xs text-gray-500">
              producto {p.productoId}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
