import { apiClient } from "./api.client";
import type { Pedido, ValidarPedidoInput, EstadoPedido } from "@/types/pedido";

export const pedidosApi = {
  listar: async (estado?: EstadoPedido): Promise<Pedido[]> => {
    const { data } = await apiClient.get<Pedido[]>("/pedidos", {
      params: estado ? { estado } : undefined,
    });
    return data;
  },

  obtener: async (id: string): Promise<Pedido> => {
    const { data } = await apiClient.get<Pedido>(`/pedidos/${id}`);
    return data;
  },

  validar: async (input: ValidarPedidoInput): Promise<Pedido> => {
    const { data } = await apiClient.patch<Pedido>(
      `/pedidos/${input.pedidoId}/validar`,
      input
    );
    return data;
  },
};
