import { apiClient } from "./api.client";
import type { Producto, ProductoInput, Categoria } from "@/types/producto";

export interface CrearProductoPayload {
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  description?: string;
  image?: File | null;
}

export const productosApi = {
  listar: async (): Promise<Producto[]> => {
    const { data } = await apiClient.get<Producto[]>("/productos");
    return data;
  },

  obtener: async (id: string): Promise<Producto> => {
    const { data } = await apiClient.get<Producto>(`/productos/${id}`);
    return data;
  },

  crear: async (payload: CrearProductoPayload): Promise<Producto> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("price", payload.price.toString());
    formData.append("stock", payload.stock.toString());
    formData.append("categoryName", payload.categoryName);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.image) {
      formData.append("image", payload.image); // Envia el archivo real File
    }

    const { data } = await apiClient.post<Producto>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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