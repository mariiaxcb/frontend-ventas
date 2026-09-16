"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { PostulanteEvento } from "@/types/socket";

interface ListaPostulantesProps {
  onVentaConfirmada?: () => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export function ListaPostulantes({ onVentaConfirmada }: ListaPostulantesProps) {
  const [postulantes, setPostulantes] = useState<PostulanteEvento[]>([]);
  const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<PostulanteEvento | null>(null);
  const [precio, setPrecio] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recibir eventos de socket en tiempo real directamente en la RAM del navegador
  useSocket({
    onPostulante: (data) => setPostulantes((prev) => [data, ...prev].slice(0, 50)),
  });

  const handleConfirmarVenta = async () => {
    if (!postulanteSeleccionado || !precio) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ventas/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioTiktok: postulanteSeleccionado.usuarioTiktok,
          productoId: postulanteSeleccionado.productoId,
          precio: parseFloat(precio),
        }),
      });

      if (!response.ok) throw new Error("Error al guardar la venta");

      // Remover el postulante procesado de la lista en pantalla
      setPostulantes((prev) => prev.filter((p) => p !== postulanteSeleccionado));

      if (onVentaConfirmada) onVentaConfirmada();

      setPostulanteSeleccionado(null);
      setPrecio("");
    } catch (error) {
      console.error("Error guardando venta:", error);
      alert("No se pudo conectar con el servidor Express.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900 relative">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/40">
        <span className="font-poppins font-medium uppercase tracking-wider text-xs text-slate-200">
          Compradores con reservacion
        </span>
        <span className="text-xs text-slate-400 font-inter">
          {postulantes.length} pendientes
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {postulantes.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Sin postulaciones pendientes.</p>
        )}

        {postulantes.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-md bg-slate-950/50 border border-slate-800 px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-poppins font-medium text-cyan-400">@{p.usuarioTiktok}</span>
              <span className="text-xs font-inter text-slate-400">
                Producto: <strong className="text-slate-200">{p.productoId}</strong>
              </span>
            </div>
            <button
              onClick={() => setPostulanteSeleccionado(p)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded transition-colors"
            >
              Vender
            </button>
          </div>
        ))}
      </div>

      {postulanteSeleccionado && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-4 shadow-xl">
            <h3 className="font-poppins font-semibold text-sm text-slate-200 border-b border-slate-800 pb-2">
              Confirmar Venta
            </h3>
            <div className="text-xs space-y-1 font-inter text-slate-300">
              <p>Cliente: <span className="text-cyan-400 font-semibold">@{postulanteSeleccionado.usuarioTiktok}</span></p>
              <p>Producto: <span className="text-slate-100 font-semibold">{postulanteSeleccionado.productoId}</span></p>
            </div>
            <div>
              <label className="block text-xs font-inter text-slate-400 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPostulanteSeleccionado(null)} className="rounded px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800">
                Cancelar
              </button>
              <button
                onClick={handleConfirmarVenta}
                disabled={!precio || isSubmitting}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar en BD"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}