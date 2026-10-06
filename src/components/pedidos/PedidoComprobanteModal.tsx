"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import { ESTADO_PEDIDO_LABELS } from "@/types/pedido";
import type { Pedido } from "@/types/pedido";

interface PedidoComprobanteModalProps {
  pedido: Pedido | null;
  onClose: () => void;
  onValidar?: (pedido: Pedido) => void;
  onRechazar?: (pedido: Pedido) => void;
}

/**
 * Comprobante de pago del pedido, con la imagen del recibo del banco.
 * Permite aprobar o rechazar el pago si aún está pendiente de decisión.
 */
export function PedidoComprobanteModal({
  pedido,
  onClose,
  onValidar,
  onRechazar,
}: PedidoComprobanteModalProps) {
  const [imagenAmpliada, setImagenAmpliada] = useState(false);

  // Al cambiar de pedido se cierra la vista ampliada.
  useEffect(() => {
    setImagenAmpliada(false);
  }, [pedido?.id]);

  useEffect(() => {
    if (!imagenAmpliada) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImagenAmpliada(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagenAmpliada]);

  if (!pedido) return null;

  const comprobante = pedido.receipt;
  const producto = pedido.orderItems[0]?.product;
  const cantidad = pedido.orderItems[0]?.quantity ?? 0;
  const pendienteDeDecision = pedido.status === "IN_REVIEW";

  return (
    <>
      <Modal abierto={!!pedido} onClose={onClose} titulo={`Comprobante - Pedido #${pedido.id}`}>
        <div className="space-y-4">
          {/* Datos del pedido */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-surface-border bg-brand-darkest/30 p-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Cliente</p>
              <p className="mt-0.5 font-medium text-slate-100">
                @{pedido.buyer?.tiktokUsername || "—"}
              </p>
              <p className="text-xs text-slate-400">{pedido.buyer?.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Estado</p>
              <div className="mt-1">
                <Badge estado={pedido.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Producto</p>
              <p className="mt-0.5 font-medium text-slate-100">{producto?.name ?? "—"}</p>
              <p className="text-xs text-slate-400">
                {producto?.code} · {cantidad} unidad{cantidad === 1 ? "" : "es"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="mt-0.5 font-poppins text-lg font-bold text-brand-cyan">
                {formatoMoneda(Number(pedido.totalPrice))}
              </p>
            </div>
          </div>

          {/* Imagen del comprobante */}
          {comprobante?.imageUrl ? (
            <button
              type="button"
              onClick={() => setImagenAmpliada(true)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-surface-border bg-brand-darkest/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comprobante.imageUrl}
                alt={`Comprobante del pedido ${pedido.id}`}
                className="max-h-[320px] w-full object-contain transition-transform group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-sm">
                <Eye size={12} />
                Ampliar
              </span>
            </button>
          ) : (
            <div className="rounded-lg border border-dashed border-surface-border bg-brand-darkest/20 p-8 text-center">
              <p className="text-sm text-slate-400">
                Este pedido todavía no tiene comprobante
              </p>
            </div>
          )}

          {/* Monto detectado por el OCR */}
          {comprobante?.extractedAmount != null && (
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-brand-darkest/30 p-3">
              <span className="text-sm text-slate-400">Monto detectado por OCR</span>
              <span className="font-poppins text-base font-bold text-brand-cyan">
                {formatoMoneda(Number(comprobante.extractedAmount))}
              </span>
            </div>
          )}

          {/* Acciones del vendedor */}
          {pendienteDeDecision && onValidar && onRechazar && (
            <div className="flex gap-3 border-t border-surface-border pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => onRechazar(pedido)}
              >
                <X size={16} />
                Rechazar pago
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => onValidar(pedido)}>
                Validar pago
              </Button>
            </div>
          )}

          {!pendienteDeDecision && (
            <p className="rounded-lg bg-brand-darkest/40 p-3 text-center text-xs text-slate-400">
              Este pedido está en estado: {ESTADO_PEDIDO_LABELS[pedido.status]}
            </p>
          )}
        </div>
      </Modal>

      {/* Vista ampliada de la imagen */}
      {imagenAmpliada && comprobante?.imageUrl && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setImagenAmpliada(false)}
        >
          <button
            type="button"
            onClick={() => setImagenAmpliada(false)}
            className="mb-3 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-sm hover:bg-white/20"
          >
            <X size={16} />
            Cerrar
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comprobante.imageUrl}
            alt="Comprobante ampliado"
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}