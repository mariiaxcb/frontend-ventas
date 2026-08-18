import { apiClient } from "./api.client";
import type { Producto, ProductoInput, Categoria } from "@/types/producto";

export const productosApi = {
  listar: async (): Promise<Producto[]> => {
    const { data } = await apiClient.get<Producto[]>("/productos");
    return data;
  },

  obtener: async (id: string): Promise<Producto> => {
    const { data } = await apiClient.get<Producto>(`/productos/${id}`);
    return data;
  },

  crear: async (input: ProductoInput): Promise<Producto> => {
    const { data } = await apiClient.post<Producto>("/productos", input);
    return data;
  },

  actualizar: async (id: string, input: Partial<ProductoInput>): Promise<Producto> => {
    const { data } = await apiClient.put<Producto>(`/productos/${id}`, input);
    return data;
  },

  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/productos/${id}`);
  },

  // --- CATEGORÍAS ---

  listarCategorias: async (): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>("/categorias");
    return data;
  },

  crearCategoria: async (nombre: string): Promise<Categoria> => {
    const { data } = await apiClient.post<Categoria>("/categorias", { nombre });
    return data;
  },
};