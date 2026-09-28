"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EstadoPedido } from "@/types/pedido";

interface OrderFiltersProps {
  selectedStatus: EstadoPedido | "";
  onStatusChange: (value: EstadoPedido | "") => void;
  selectedStream: string;
  onStreamChange: (value: string) => void;
  streams: { id: string; title: string }[];
}

export function OrderFilters({
  selectedStatus,
  onStatusChange,
  selectedStream,
  onStreamChange,
  streams,
}: OrderFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-brand-primary/20 bg-brand-dark p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-300">Filtros:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as EstadoPedido | "")}
          className="rounded-md border border-brand-primary/30 bg-brand-darkest px-3 py-2 text-sm text-slate-200 focus:border-brand-cyan focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="VALIDADO">Validado</option>
          <option value="RECHAZADO">Rechazado</option>
        </select>

        <select
          value={selectedStream}
          onChange={(e) => onStreamChange(e.target.value)}
          className="rounded-md border border-brand-primary/30 bg-brand-darkest px-3 py-2 text-sm text-slate-200 focus:border-brand-cyan focus:outline-none"
        >
          <option value="">Todos los streams</option>
          {streams.map((stream) => (
            <option key={stream.id} value={stream.id}>
              {stream.title}
            </option>
          ))}
        </select>

        {(selectedStatus || selectedStream) && (
          <Button
            variant="ghost"
            onClick={() => {
              onStatusChange("");
              onStreamChange("");
            }}
            className="text-xs"
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
