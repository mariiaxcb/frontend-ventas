"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pedidosApi, type PedidosFiltros } from "@/services/pedidos.api";
import type { EstadoPedido, Pedido } from "@/types/pedido";

const PEDIDOS_KEY = ["pedidos"] as const;

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery<Pedido[]>({
    queryKey: [...PEDIDOS_KEY, filtros],
    queryFn: () => pedidosApi.listar(filtros),
  });
}

export function usePedido(id: number | null) {
  return useQuery<Pedido>({
    queryKey: [...PEDIDOS_KEY, "detalle", id],
    queryFn: () => pedidosApi.obtener(id as number),
    enabled: id !== null,
  });
}

/** El vendedor aprueba o rechaza el pago de un comprobante. */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: EstadoPedido }) =>
      pedidosApi.cambiarEstado(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY });
    },
  });
}