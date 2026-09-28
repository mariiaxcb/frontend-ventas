import { apiClient } from "./api.client";

export interface DashboardStats {
  totalProductos: number;
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosValidados: number;
  totalVentas: number;
  ventasHoy: number;
  tasaConversion: number;
}

export interface RecentOrder {
  id: number;
  usuarioTiktok: string;
  productoNombre: string;
  total: number;
  estado: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return response.data.data;
  },

  getRecentOrders: async (limit = 5): Promise<RecentOrder[]> => {
    const response = await apiClient.get<ApiResponse<RecentOrder[]>>(
      `/dashboard/recent-orders?limit=${limit}`
    );
    return response.data.data;
  },
};
