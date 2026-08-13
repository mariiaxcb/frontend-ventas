"use client";

import { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ComprobanteViewer } from "@/components/pedidos/ComprobanteViewer";
import { usePedidos, useValidarPedido } from "@/hooks/usePedidos";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import type { Pedido } from "@/types/pedido";

export default function PedidosPage() {
  const { data: pedidos, isLoading } = usePedidos();
  const validarPedido = useValidarPedido();
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Pedidos y validación de pagos
      </h1>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Cliente TikTok</TableHeadCell>
            <TableHeadCell>Código</TableHeadCell>
            <TableHeadCell>Producto</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
            <TableHeadCell>Fecha</TableHeadCell>
            <TableHeadCell>Estado</TableHeadCell>
            <TableHeadCell>Acciones</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell className="text-gray-400">Cargando…</TableCell>
            </TableRow>
          )}
          {(pedidos ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.usuarioTiktok}</TableCell>
              <TableCell>{p.codigoPedido}</TableCell>
              <TableCell>{p.productoNombre}</TableCell>
              <TableCell>{formatoMoneda(p.total)}</TableCell>
              <TableCell>{formatoFecha(p.createdAt)}</TableCell>
              <TableCell>
                <Badge estado={p.estado} />
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => setSeleccionado(p)}>
                  Revisar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        abierto={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        titulo={`Pedido de ${seleccionado?.usuarioTiktok ?? ""}`}
      >
        {seleccionado && (
          <div className="space-y-4">
            <ComprobanteViewer pedido={seleccionado} />
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                onClick={() =>
                  validarPedido.mutate({
                    pedidoId: seleccionado.id,
                    estado: "RECHAZADO",
                  })
                }
              >
                Rechazar
              </Button>
              <Button
                onClick={() =>
                  validarPedido.mutate({
                    pedidoId: seleccionado.id,
                    estado: "VALIDADO",
                  })
                }
              >
                Validar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
