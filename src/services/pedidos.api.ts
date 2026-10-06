import { apiClient } from "./api.client";
import type { Pedido, EstadoPedido } from "@/types/pedido";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PedidosFiltros {
  streamId?: number;
  status?: EstadoPedido;
  buyerId?: number;
}

export const pedidosApi = {
  /** El backend ya devuelve los pedidos ordenados por id descendente. */
  listar: async (filtros: PedidosFiltros = {}): Promise<Pedido[]> => {
    const { data } = await apiClient.get<ApiResponse<Pedido[]>>("/orders", {
      params: filtros,
    });
    return data.data;
  },

  obtener: async (id: number): Promise<Pedido> => {
    const { data } = await apiClient.get<ApiResponse<Pedido>>(`/orders/${id}`);
    return data.data;
  },

  cambiarEstado: async (id: number, status: EstadoPedido): Promise<Pedido> => {
    const { data } = await apiClient.patch<ApiResponse<Pedido>>(`/orders/${id}/status`, {
      status,
    });
    return data.data;
  },

  sincronizarPago: async (id: number): Promise<Pedido> => {
    const { data } = await apiClient.post<ApiResponse<Pedido>>(
      `/orders/${id}/sync-payment`
    );
    return data.data;
  },
};