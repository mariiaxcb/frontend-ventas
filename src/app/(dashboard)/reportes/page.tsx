"use client";

import { usePedidos } from "@/hooks/usePedidos";
import { formatoMoneda, formatoFecha } from "@/lib/utils";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function ReportesPage() {
  const { data: pedidos } = usePedidos("VALIDADO");

  const total = (pedidos ?? []).reduce((acc, p) => acc + p.total, 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">Reportes de ventas</h1>
      <p className="mb-6 text-sm font-inter text-slate-400">
        Historial de pedidos validados · Total: <span className="font-semibold text-brand-light">{formatoMoneda(total)}</span>
      </p>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Cliente TikTok</TableHeadCell>
            <TableHeadCell>Producto</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
            <TableHeadCell>Fecha</TableHeadCell>
            <TableHeadCell>Estado</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(pedidos ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.usuarioTiktok}</TableCell>
              <TableCell>{p.productoNombre}</TableCell>
              <TableCell>{formatoMoneda(p.total)}</TableCell>
              <TableCell>{formatoFecha(p.createdAt)}</TableCell>
              <TableCell>
                <Badge estado={p.estado} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
