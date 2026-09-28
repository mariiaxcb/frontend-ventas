"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShoppingCart,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { NotificacionLive, ComprobanteData } from "@/types/live";

interface NotificationPanelProps {
  notificaciones: NotificacionLive[];
  onValidarPago?: (pedidoId: number) => void;
  onRechazarPago?: (pedidoId: number) => void;
}

export function NotificationPanel({
  notificaciones,
  onValidarPago,
  onRechazarPago,
}: NotificationPanelProps) {
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<{
    notificacion: NotificacionLive;
    comprobante: ComprobanteData;
  } | null>(null);

  const getIcon = (tipo: NotificacionLive["tipo"]) => {
    switch (tipo) {
      case "reserva":
        return <Package size={16} className="text-brand-light" />;
      case "confirmacion":
        return <CheckCircle size={16} className="text-emerald-400" />;
      case "comprobante":
        return <ShoppingCart size={16} className="text-amber-400" />;
      case "timeout_tiktok":
      case "timeout_wpp":
        return <Clock size={16} className="text-red-400" />;
      case "producto_agotado":
        return <AlertTriangle size={16} className="text-amber-400" />;
      case "producto_vendido":
        return <CheckCircle size={16} className="text-emerald-400" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  const getColor = (tipo: NotificacionLive["tipo"]) => {
    switch (tipo) {
      case "reserva":
        return "border-l-brand-light";
      case "confirmacion":
        return "border-l-emerald-400";
      case "comprobante":
        return "border-l-amber-400";
      case "timeout_tiktok":
      case "timeout_wpp":
        return "border-l-red-400";
      case "producto_agotado":
        return "border-l-amber-400";
      case "producto_vendido":
        return "border-l-emerald-400";
      default:
        return "border-l-slate-400";
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-brand-primary/20 bg-brand-dark">
      <div className="flex items-center justify-between border-b border-brand-primary/10 p-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-brand-cyan" />
          <h3 className="font-poppins text-sm font-semibold text-slate-100">
            Notificaciones
          </h3>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-light">
          {notificaciones.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {notificaciones.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin notificaciones
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border-l-4 bg-brand-darkest/50 p-3 ${getColor(notif.tipo)}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getIcon(notif.tipo)}</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{notif.mensaje}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatoFecha(notif.timestamp)}
                  </p>

                  {notif.tipo === "comprobante" && notif.pedidoId && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        className="py-1 text-xs"
                        onClick={() => {
                          // Aquí se abriría el modal del comprobante
                          // Por ahora solo mostramos un placeholder
                        }}
                      >
                        Ver Comprobante
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de comprobante */}
      {comprobanteSeleccionado && (
        <Modal
          abierto={!!comprobanteSeleccionado}
          onClose={() => setComprobanteSeleccionado(null)}
          titulo="Comprobante de Pago"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-4">
              <p className="text-sm text-slate-300">
                Monto detectado:{" "}
                <span className="font-poppins font-bold text-brand-cyan">
                  {formatoMoneda(comprobanteSeleccionado.comprobante.extractedAmount)}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  if (comprobanteSeleccionado.notificacion.pedidoId && onRechazarPago) {
                    onRechazarPago(comprobanteSeleccionado.notificacion.pedidoId);
                  }
                  setComprobanteSeleccionado(null);
                }}
              >
                <XCircle size={16} />
                Rechazar Pago
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  if (comprobanteSeleccionado.notificacion.pedidoId && onValidarPago) {
                    onValidarPago(comprobanteSeleccionado.notificacion.pedidoId);
                  }
                  setComprobanteSeleccionado(null);
                }}
              >
                <CheckCircle size={16} />
                Validar Pago
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
