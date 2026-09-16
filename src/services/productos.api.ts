import { apiClient } from "./api.client";
import type { Producto, ProductoInput, Categoria } from "@/types/producto";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CrearProductoPayload {
  code: string; // <-- Propiedad añadida
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  description?: string;
  image?: File | null;
}

export const productosApi = {
  // GET: /products -> Retorna el array dentro de data.data
  listar: async (): Promise<Producto[]> => {
    const response = await apiClient.get<ApiResponse<Producto[]>>("/products");
    return response.data.data;
  },

  // GET: /products/:id
  obtener: async (id: string | number): Promise<Producto> => {
    const response = await apiClient.get<ApiResponse<Producto>>(`/products/${id}`);
    return response.data.data;
  },

  // GET: /products/check-code?code=VALOR
  verificarCodigo: async (code: string): Promise<{ exists: boolean }> => {
    const response = await apiClient.get<{ exists: boolean }>("/products/check-code", {
      params: { code },
    });
    return response.data;
  },

  // POST: /products
  crear: async (payload: CrearProductoPayload): Promise<Producto> => {
    const formData = new FormData();
    formData.append("code", payload.code); // <-- Añadido al FormData
    formData.append("name", payload.name);
    formData.append("price", payload.price.toString());
    formData.append("stock", payload.stock.toString());
    formData.append("categoryName", payload.categoryName);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

    const response = await apiClient.post<ApiResponse<Producto>>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  // PUT: /products/:id
  actualizar: async (
    id: string | number,
    input: Partial<ProductoInput> | FormData
  ): Promise<Producto> => {
    const isFormData = input instanceof FormData;
    const response = await apiClient.put<ApiResponse<Producto>>(
      `/products/${id}`,
      input,
      {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      }
    );
    return response.data.data;
  },

  // DELETE: /products/:id
  eliminar: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // --- CATEGORÍAS ---

  // GET: /products/categories
  listarCategorias: async (): Promise<Categoria[]> => {
    const response = await apiClient.get<ApiResponse<Categoria[]> | Categoria[]>("/products/categories");

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data?.data || [];
  },

  // POST: /products/categories
  crearCategoria: async (nombre: string): Promise<Categoria> => {
    const response = await apiClient.post<ApiResponse<Categoria>>("/products/categories", { name: nombre });
    return response.data?.data ?? response.data;
  },
};