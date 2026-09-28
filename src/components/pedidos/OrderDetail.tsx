"use client";

import { X, User, Package, Calendar, CreditCard } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ComprobanteViewer } from "./ComprobanteViewer";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { Pedido } from "@/types/pedido";

interface OrderDetailProps {
  pedido: Pedido | null;
  onClose: () => void;
  onValidate?: (pedido: Pedido, estado: "VALIDADO" | "RECHAZADO") => void;
}

export function OrderDetail({ pedido, onClose, onValidate }: OrderDetailProps) {
  if (!pedido) return null;

  return (
    <Modal abierto={!!pedido} onClose={onClose} titulo={`Pedido #${pedido.id}`}>
      <div className="space-y-6">
        {/* Info del cliente */}
        <div className="rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-4">
          <h4 className="mb-3 font-poppins text-sm font-semibold text-slate-100">
            Información del Cliente
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-brand-light" />
              <span className="text-slate-300">{pedido.usuarioTiktok}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package size={14} className="text-brand-light" />
              <span className="text-slate-300">{pedido.productoNombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-brand-light" />
              <span className="text-slate-300">{formatoFecha(pedido.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard size={14} className="text-brand-light" />
              <span className="font-poppins font-semibold text-brand-cyan">
                {formatoMoneda(pedido.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Estado:</span>
          <Badge estado={pedido.estado} />
        </div>

        {/* Comprobante */}
        <ComprobanteViewer pedido={pedido} />

        {/* Acciones */}
        {onValidate && pedido.estado === "PENDIENTE" && (
          <div className="flex gap-3 border-t border-brand-primary/10 pt-4">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => onValidate(pedido, "RECHAZADO")}
            >
              Rechazar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => onValidate(pedido, "VALIDADO")}
            >
              Validar Pago
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
