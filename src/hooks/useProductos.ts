"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productosApi } from "@/services/productos.api";
import type { ProductoInput } from "@/types/producto";

const QUERY_KEY = ["productos"];

export function useProductos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: productosApi.listar,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductoInput) => productosApi.crear(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductoInput> }) =>
      productosApi.actualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productosApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
