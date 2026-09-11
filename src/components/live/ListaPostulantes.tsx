"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { PostulanteEvento } from "@/types/socket";

interface ListaPostulantesProps {
  onVentaConfirmada?: () => void;
}

export function ListaPostulantes({ onVentaConfirmada }: ListaPostulantesProps) {
  const [postulantes, setPostulantes] = useState<PostulanteEvento[]>([]);
  const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<PostulanteEvento | null>(null);
  const [precio, setPrecio] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar postulantes iniciales guardados en Redis
  useEffect(() => {
    const fetchPostulantesGuardados = async () => {
      try {
        const response = await fetch("/api/postulantes"); // Endpoint que lee de Redis
        if (response.ok) {
          const data: PostulanteEvento[] = await response.json();
          setPostulantes(data);
        }
      } catch (error) {
        console.error("Error al cargar postulantes de Redis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostulantesGuardados();
  }, []);

  // 2. Escuchar nuevos eventos por WebSocket y agregarlos
  useSocket({
    onPostulante: (data) => setPostulantes((prev) => [data, ...prev].slice(0, 50)),
  });

  const handleConfirmarVenta = async () => {
    if (!postulanteSeleccionado || !precio) return;

    setIsSubmitting(true);

    try {
      // Guardar venta mediante API HTTP/REST
      const response = await fetch("/api/ventas/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioTiktok: postulanteSeleccionado.usuarioTiktok,
          productoId: postulanteSeleccionado.productoId,
          precio: parseFloat(precio),
        }),
      });

      if (!response.ok) throw new Error("Error al procesar la venta");

      // Remover del estado local en RAM
      setPostulantes((prev) =>
        prev.filter((p) => p !== postulanteSeleccionado)
      );

      // Notificar al padre (page.tsx)
      if (onVentaConfirmada) {
        onVentaConfirmada();
      }

      setPostulanteSeleccionado(null);
      setPrecio("");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-brand-primary/20 bg-brand-dark relative">
      <div className="flex items-center justify-between border-b border-brand-primary/10 px-4 py-3 bg-brand-darkest/40">
        <span className="font-poppins font-medium uppercase tracking-wider text-xs text-brand-light">
          Postulantes a productos
        </span>
        <span className="text-xs text-slate-400 font-inter">
          {postulantes.length} pendientes
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {isLoading && (
          <p className="text-sm text-slate-400 font-inter animate-pulse">
            Cargando postulantes de Redis...
          </p>
        )}

        {!isLoading && postulantes.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Sin postulaciones aún.</p>
        )}

        {postulantes.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-brand-darkest/50 border border-brand-primary/10 px-3 py-2 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-poppins font-medium text-brand-cyan">
                @{p.usuarioTiktok}
              </span>
              <span className="text-xs font-inter text-slate-400">
                Producto: <strong className="text-slate-200">{p.productoId}</strong>
              </span>
            </div>

            <button
              onClick={() => setPostulanteSeleccionado(p)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded font-poppins font-medium transition-colors"
            >
              Vender
            </button>
          </div>
        ))}
      </div>

      {postulanteSeleccionado && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-darkest/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-brand-primary/30 bg-brand-dark p-4 space-y-4 shadow-xl">
            <h3 className="font-poppins font-semibold text-sm text-brand-light border-b border-brand-primary/10 pb-2">
              Confirmar Venta
            </h3>

            <div className="text-xs space-y-1 font-inter text-slate-300">
              <p>Cliente: <span className="text-brand-cyan font-semibold">@{postulanteSeleccionado.usuarioTiktok}</span></p>
              <p>Producto: <span className="text-slate-100 font-semibold">{postulanteSeleccionado.productoId}</span></p>
            </div>

            <div>
              <label className="block text-xs font-inter text-slate-400 mb-1">
                Precio acordado ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full rounded border border-brand-primary/20 bg-brand-darkest p-2 text-sm text-slate-100 focus:border-brand-cyan focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPostulanteSeleccionado(null)}
                className="rounded px-3 py-1.5 text-xs text-slate-400 hover:bg-brand-primary/10"
              >
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