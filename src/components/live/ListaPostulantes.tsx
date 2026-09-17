"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthContext";
import type { PostulanteEvento } from "@/types/socket";

interface ListaPostulantesProps {
  streamId?: number;
  onVentaConfirmada?: () => void;
}

interface Comprador {
  usuarioTiktok: string;
  nickname?: string;
  comentario?: string;
  timestamp: string;
}

interface GrupoProducto {
  productoId: string;
  productoNombre: string;
  stock?: number;
  limite?: number;
  compradores: Comprador[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function calcularLimite(stock?: number): number | undefined {
  if (stock === undefined) return undefined;
  if (stock <= 0) return 0;
  if (stock === 1) return 3;
  return stock;
}

export function ListaPostulantes({ streamId }: ListaPostulantesProps) {
  const { token } = useAuth();
  const [grupos, setGrupos] = useState<GrupoProducto[]>([]);

  const agregarComprador = (evento: PostulanteEvento) => {
    setGrupos((prev) => {
      const existente = prev.find((g) => g.productoId === evento.productoId);
      const nombre =
        evento.nickname && evento.nickname !== "Usuario_Anonimo"
          ? evento.nickname
          : evento.usuarioTiktok;
      const comprador: Comprador = {
        usuarioTiktok: nombre,
        nickname: evento.nickname,
        comentario: evento.comentario,
        timestamp: evento.timestamp,
      };

      if (existente) {
        if (existente.compradores.some((c) => c.usuarioTiktok === comprador.usuarioTiktok)) {
          return prev;
        }
        return prev.map((g) =>
          g.productoId === evento.productoId
            ? {
                ...g,
                productoNombre: evento.productoNombre ?? g.productoNombre,
                stock: evento.stock ?? g.stock,
                limite: evento.limite ?? g.limite,
                compradores: [...g.compradores, comprador],
              }
            : g,
        );
      }

      return [
        {
          productoId: evento.productoId,
          productoNombre: evento.productoNombre ?? evento.productoId,
          stock: evento.stock,
          limite: evento.limite ?? calcularLimite(evento.stock),
          compradores: [comprador],
        },
        ...prev,
      ];
    });
  };

  useSocket({
    onPostulante: agregarComprador,
  });

  useEffect(() => {
    if (!streamId || !token) return;

    const cargarReservas = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reservations/stream/${streamId}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;

        const json = await res.json();
        const reservas: Array<{
          tiktokUsername: string;
          productCode: string;
          comment: string | null;
          timestamp: string;
          product?: { name: string; stock: number } | null;
        }> = json.data ?? [];

        setGrupos((prev) => {
          const siguientes = prev.map((g) => ({ ...g, compradores: [...g.compradores] }));

          for (const reserva of reservas) {
            let grupo = siguientes.find((g) => g.productoId === reserva.productCode);
            if (!grupo) {
              grupo = {
                productoId: reserva.productCode,
                productoNombre: reserva.product?.name ?? reserva.productCode,
                stock: reserva.product?.stock,
                limite: calcularLimite(reserva.product?.stock),
                compradores: [],
              };
              siguientes.push(grupo);
            }
            if (!grupo.compradores.some((c) => c.usuarioTiktok === reserva.tiktokUsername)) {
              grupo.compradores.push({
                usuarioTiktok: reserva.tiktokUsername,
                comentario: reserva.comment ?? undefined,
                timestamp: reserva.timestamp,
              });
            }
          }

          return siguientes;
        });
      } catch (error) {
        console.error("Error cargando reservas:", error);
      }
    };

    cargarReservas();
  }, [streamId, token]);

  const totalCompradores = grupos.reduce((acc, g) => acc + g.compradores.length, 0);

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900 relative">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/40">
        <span className="font-poppins font-medium uppercase tracking-wider text-xs text-slate-200">
          Compradores con reservacion
        </span>
        <span className="text-xs text-slate-400 font-inter">
          {totalCompradores} compradores
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {grupos.length === 0 && (
          <p className="text-sm text-slate-400 font-inter">Sin compradores con reserva.</p>
        )}

        {grupos.map((grupo) => (
          <div
            key={grupo.productoId}
            className="rounded-md border border-slate-800 bg-slate-950/50 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2">
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm text-slate-100">
                  {grupo.productoNombre}
                </span>
                <span className="text-[11px] font-inter text-slate-400">
                  Código: <strong className="text-slate-200">{grupo.productoId}</strong>
                </span>
              </div>
              <span className="text-xs font-inter bg-cyan-500/10 text-brand-cyan border border-cyan-500/20 px-2 py-1 rounded">
                {grupo.compradores.length}
                {grupo.limite !== undefined ? `/${grupo.limite}` : ""}
              </span>
            </div>

            <ul className="divide-y divide-slate-800/60">
              {grupo.compradores.map((c, i) => (
                <li key={`${c.usuarioTiktok}-${i}`} className="px-3 py-2">
                  <span className="font-poppins font-medium text-sm text-cyan-400">
                    @{c.usuarioTiktok}
                  </span>
                  {c.comentario && (
                    <p className="text-xs font-inter text-slate-400 mt-0.5">{c.comentario}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
