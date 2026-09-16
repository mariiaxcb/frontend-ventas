"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productosApi, type CrearProductoPayload } from "@/services/productos.api";
import type { ProductoInput } from "@/types/producto";

const QUERY_KEYS = {
  productos: ["productos"] as const,
  categorias: ["categorias"] as const,
  validarCodigo: (code: string) => ["validar-codigo", code] as const,
};

// --- HOOKS DE PRODUCTOS ---

export function useProductos() {
  return useQuery({
    queryKey: QUERY_KEYS.productos,
    queryFn: productosApi.listar,
  });
}

export function useValidarCodigo(codigo: string) {
  const [codigoDebounced, setCodigoDebounced] = useState(codigo);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCodigoDebounced(codigo.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [codigo]);

  return useQuery({
    queryKey: QUERY_KEYS.validarCodigo(codigoDebounced),
    queryFn: () => productosApi.verificarCodigo(codigoDebounced),
    enabled: codigoDebounced.length > 0, // Solo se ejecuta si hay texto
    retry: false,
    staleTime: 1000 * 60, // Cache de 1 minuto
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearProductoPayload) => productosApi.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productos });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductoInput> }) =>
      productosApi.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productos });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productosApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productos });
    },
  });
}

// --- HOOKS DE CATEGORÍAS ---

export function useCategorias() {
  return useQuery({
    queryKey: QUERY_KEYS.categorias,
    queryFn: productosApi.listarCategorias,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => productosApi.crearCategoria(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categorias });
    },
  });
}