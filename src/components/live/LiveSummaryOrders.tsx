"use client";

import { useState } from "react";
import { Eye, Receipt, X, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatoFecha, formatoMoneda } from "@/lib/utils";
import type { ResumenOrden } from "@/services/streams.api";
import type { EstadoPedido } from "@/types/pedido";

const POR_PAGINA = 8;

/**
 * Listado de órdenes del live con acceso directo al comprobante de pago.
 *
 * El vendedor necesita revisar el comprobante sin salirse del resumen, así
 * que cada fila abre la imagen en un visor con zoom.
 */
export function LiveSummaryOrders({ ordenes }: { ordenes: ResumenOrden[] }) {
  const [pagina, setPagina] = useState(1);
  const [comprobante, setComprobante] = useState<{
    url: string;
    orden: ResumenOrden;
  } | null>(null);

  if (ordenes.length === 0) return null;

  const totalPaginas = Math.max(1, Math.ceil(ordenes.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = ordenes.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  return (
    <>
      <Card>
        <CardHeader
          title="Listado de ordenes"
          subtitle={`${ordenes.length} orden${ordenes.length === 1 ? "" : "es"} en esta transmision`}
        />
        <CardContent>
          <div className="space-y-3">
            {visibles.map((orden) => {
              const primerItem = orden.items[0];
              const producto = primerItem?.product;
              const cantidad = orden.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={orden.id}
                  className="flex flex-col gap-3 rounded-lg border border-surface-border bg-brand-darkest/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {producto?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={producto.imageUrl}
                        alt={producto.name}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-primary/15">
                        <Receipt size={20} className="text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          #{orden.id}
                        </span>
                        <Badge estado={orden.status as EstadoPedido} />
                      </div>

                      <p className="mt-1 truncate text-sm font-medium text-slate-100">
                        {producto?.name ?? "Producto eliminado"}
                        {cantidad > 1 && (
                          <span className="text-slate-400"> x{cantidad}</span>
                        )}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {orden.tiktokUsername
                          ? `@${orden.tiktokUsername}`
                          : orden.clientName}
                        {" · "}
                        {formatoFecha(orden.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <p className="font-poppins text-base font-bold text-brand-cyan">
                      {formatoMoneda(Number(orden.totalPrice))}
                    </p>

                    {orden.receipt ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setComprobante({
                            url: orden.receipt!.imageUrl,
                            orden,
                          })
                        }
                      >
                        <Eye size={14} />
                        Comprobante
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Sin comprobante
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            className="mt-4"
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            totalElementos={ordenes.length}
            porPagina={POR_PAGINA}
            onCambio={setPagina}
          />
        </CardContent>
      </Card>

      {comprobante && (
        <ComprobanteVisor
          url={comprobante.url}
          orden={comprobante.orden}
          onClose={() => setComprobante(null)}
        />
      )}
    </>
  );
}

interface ComprobanteVisorProps {
  url: string;
  orden: ResumenOrden;
  onClose: () => void;
}

/** Modal con la imagen del comprobante, amplification y descarga. */
function ComprobanteVisor({ url, orden, onClose }: ComprobanteVisorProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-3 rounded-xl border border-surface-border bg-brand-dark p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-poppins text-sm font-bold text-slate-100">
              Comprobante del pedido #{orden.id}
            </p>
            <p className="truncate text-xs text-slate-400">
              {orden.tiktokUsername
                ? `@${orden.tiktokUsername}`
                : orden.clientName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              disabled={zoom <= 1}
              aria-label="Reducir"
            >
              <ZoomOut size={16} />
            </Button>
            <span className="w-12 text-center text-xs text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
              disabled={zoom >= 3}
              aria-label="Ampliar"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-lg bg-black/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Comprobante del pedido ${orden.id}`}
            className="mx-auto max-w-full rounded-md"
            style={{ width: `${zoom * 100}%` }}
          />
        </div>

        <p className="text-xs text-slate-400">
          Revisa que la referencia y el monto correspondan a este pedido antes
          de validarlo en Pedidos.
        </p>
      </div>
    </div>
  );
}