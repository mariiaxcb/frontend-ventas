"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShoppingCart,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { NotificacionLive, ComprobanteData } from "@/types/live";

interface NotificationPanelProps {
  notificaciones: NotificacionLive[];
  onValidarPago?: (pedidoId: number) => void;
  onRechazarPago?: (pedidoId: number) => void;
  token?: string;
}

type FiltroTipo = "todas" | "reservas" | "pagos" | "comprobantes" | "ventas" | "alertas";

export function NotificationPanel({
  notificaciones,
  onValidarPago,
  onRechazarPago,
  token,
}: NotificationPanelProps) {
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<{
    notificacion: NotificacionLive;
    comprobante: ComprobanteData;
  } | null>(null);
  const [filtro, setFiltro] = useState<FiltroTipo>("todas");
  const [expandido, setExpandido] = useState(true);

  // Consultar el estado real del pedido cuando se abre el modal
  useEffect(() => {
    if (!comprobanteSeleccionado?.notificacion.pedidoId || !token) return;

    const consultarEstadoPedido = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/orders/${comprobanteSeleccionado.notificacion.pedidoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const pedido = data.data;

          // El estado del pedido define si el comprobante sigue pendiente
          // de decision del vendedor o ya fue resuelto.
          let validationStatus = "PENDING";
          if (pedido.status === "PAID") {
            validationStatus = "VALIDATED";
          } else if (pedido.status === "REJECTED") {
            validationStatus = "REJECTED";
          } else if (pedido.status === "IN_REVIEW") {
            validationStatus = "IN_REVIEW";
          }

          setComprobanteSeleccionado((prev) =>
            prev
              ? {
                  ...prev,
                  comprobante: { ...prev.comprobante, validationStatus },
                }
              : prev
          );
        }
      } catch (error) {
        console.error("Error consultando estado del pedido:", error);
      }
    };

    consultarEstadoPedido();
  }, [comprobanteSeleccionado?.notificacion.pedidoId, token]);

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

  const getTipoCategoria = (tipo: NotificacionLive["tipo"]): FiltroTipo => {
    switch (tipo) {
      case "reserva":
        return "reservas";
      case "confirmacion":
        return "pagos";
      case "comprobante":
        return "comprobantes";
      case "producto_vendido":
        return "ventas";
      case "timeout_tiktok":
      case "timeout_wpp":
      case "producto_agotado":
        return "alertas";
      default:
        return "todas";
    }
  };

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === "todas") return true;
    return getTipoCategoria(n.tipo) === filtro;
  });

  const conteos = {
    todas: notificaciones.length,
    reservas: notificaciones.filter((n) => getTipoCategoria(n.tipo) === "reservas").length,
    pagos: notificaciones.filter((n) => getTipoCategoria(n.tipo) === "pagos").length,
    comprobantes: notificaciones.filter((n) => getTipoCategoria(n.tipo) === "comprobantes").length,
    ventas: notificaciones.filter((n) => getTipoCategoria(n.tipo) === "ventas").length,
    alertas: notificaciones.filter((n) => getTipoCategoria(n.tipo) === "alertas").length,
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-brand-primary/20 bg-brand-dark">
      {/* Header con filtros */}
      <div className="border-b border-brand-primary/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-brand-cyan" />
            <h3 className="font-poppins text-sm font-semibold text-slate-100">
              Notificaciones
            </h3>
          </div>
          <button
            onClick={() => setExpandido(!expandido)}
            className="rounded-md p-1 text-slate-400 hover:bg-brand-primary/10 hover:text-slate-200"
          >
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expandido && (
          <div className="flex flex-wrap gap-2">
            {(["todas", "reservas", "pagos", "comprobantes", "ventas", "alertas"] as FiltroTipo[]).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filtro === tipo
                    ? "bg-brand-primary text-white"
                    : "bg-brand-darkest/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)} ({conteos[tipo]})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {notificacionesFiltradas.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin notificaciones
          </div>
        ) : (
          notificacionesFiltradas.map((notif) => (
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
                          if (!notif.pedidoId) return;
                          setComprobanteSeleccionado({
                            notificacion: notif,
                            comprobante: {
                              id: notif.pedidoId,
                              imageUrl: notif.comprobanteUrl || "",
                              extractedAmount: notif.monto || 0,
                              validationStatus: "PENDING",
                              orderId: notif.pedidoId,
                            },
                          });
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

      {/* Modal de comprobante con imagen ampliable */}
      {comprobanteSeleccionado && (
        <Modal
          abierto={!!comprobanteSeleccionado}
          onClose={() => setComprobanteSeleccionado(null)}
          titulo="Comprobante de Pago"
        >
          <div className="space-y-4">
            {/* Imagen del comprobante - clicable para ampliar */}
            {comprobanteSeleccionado.comprobante.imageUrl ? (
              <div
                className="group relative cursor-zoom-in overflow-hidden rounded-lg border border-brand-primary/20 bg-brand-darkest/30"
                onClick={() => {
                  window.open(comprobanteSeleccionado?.comprobante.imageUrl, "_blank");
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comprobanteSeleccionado.comprobante.imageUrl}
                  alt="Comprobante de pago"
                  className="max-h-[400px] w-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    Clic para ampliar
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-brand-primary/10 bg-brand-darkest/30">
                <p className="text-sm text-slate-400">No hay imagen disponible</p>
              </div>
            )}

            {/* Información del comprobante */}
            <div className="rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Monto detectado:</span>
                  <span className="font-poppins text-lg font-bold text-brand-cyan">
                    {formatoMoneda(comprobanteSeleccionado.comprobante.extractedAmount)}
                  </span>
                </div>
                {comprobanteSeleccionado.notificacion.usuarioTiktok && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Cliente:</span>
                    <span className="text-sm font-medium text-slate-200">
                      @{comprobanteSeleccionado.notificacion.usuarioTiktok}
                    </span>
                  </div>
                )}
                {comprobanteSeleccionado.notificacion.productoNombre && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Producto:</span>
                    <span className="text-sm font-medium text-slate-200">
                      {comprobanteSeleccionado.notificacion.productoNombre}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción - solo si el comprobante no ha sido validado o rechazado */}
            {comprobanteSeleccionado.comprobante.validationStatus !== 'VALIDATED' &&
              comprobanteSeleccionado.comprobante.validationStatus !== 'REJECTED' && (
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
              )}

            {/* Mensaje si el comprobante ya fue validado o rechazado */}
            {(comprobanteSeleccionado.comprobante.validationStatus === 'VALIDATED' ||
              comprobanteSeleccionado.comprobante.validationStatus === 'REJECTED') && (
              <div className="rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-3 text-center">
                <p className="text-sm text-slate-400">
                  {comprobanteSeleccionado.comprobante.validationStatus === 'VALIDATED'
                    ? 'Este comprobante ya fue validado'
                    : 'Este comprobante ya fue rechazado'}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
