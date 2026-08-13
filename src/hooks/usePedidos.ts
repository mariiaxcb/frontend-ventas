"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "@/services/pedidos.api";
import type { EstadoPedido, ValidarPedidoInput } from "@/types/pedido";

export function usePedidos(estado?: EstadoPedido) {
  return useQuery({
    queryKey: ["pedidos", estado ?? "todos"],
    queryFn: () => pedidosApi.listar(estado),
  });
}

export function useValidarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ValidarPedidoInput) => pedidosApi.validar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
  });
}
