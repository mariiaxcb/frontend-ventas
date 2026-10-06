import { apiClient } from "./api.client";

export interface Stream {
  id: number;
  title: string;
  tiktokUsername: string;
  startDate: string;
  endDate?: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  adminId: number;
  /** Productos ofertados en el live. */
  products?: { id: number; code: string; name: string; stock: number }[];
  /** Totales que devuelve el listado de streams. */
  _count?: { orders: number };
}

export interface CreateStreamInput {
  title: string;
  tiktokUsername: string;
}

/** Producto ofertado en el live, con el stock restante al finalizar. */
export interface ResumenProducto {
  id: number;
  code: string;
  name: string;
  price: string;
  imageUrl?: string | null;
  /** Unidades disponibles actualmente en inventario. */
  stock: number;
  /** Unidades vendidas durante este live. */
  sold: number;
}

/** Métricas mostradas al vendedor al finalizar la transmisión. */
export interface LiveSummary {
  streamId: number;
  title: string;
  tiktokUsername: string;
  status: Stream["status"];
  startDate: string;
  endDate: string | null;
  /** Milisegundos transcurridos desde el inicio del live. */
  durationMs: number;
  /** Personas distintas que dejaron una reserva. */
  reservationsTotal: number;
  /** Reservas perdidas por falta de confirmación o pago. */
  cancelledReservations: number;
  /** Órdenes pagadas o entregadas. */
  totalSales: number;
  totalRevenue: string;
  ordersSummary: { status: string; count: number }[];
  /** Detalle de cada orden del live, con su comprobante de pago. */
  orders: ResumenOrden[];
  products: ResumenProducto[];
}

/** Una orden del live tal como la devuelve el resumen. */
export interface ResumenOrden {
  id: number;
  status: string;
  totalPrice: string;
  createdAt: string;
  tiktokUsername: string | null;
  clientName: string;
  items: {
    quantity: number;
    unitPrice: string;
    product: {
      id: number;
      name: string;
      code: string;
      imageUrl: string | null;
    };
  }[];
  receipt: {
    imageUrl: string;
    extractedAmount: string | null;
    validationStatus: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const streamsApi = {
  list: async (): Promise<Stream[]> => {
    const response = await apiClient.get<ApiResponse<Stream[]>>("/streams");
    return response.data.data;
  },

  getActive: async (): Promise<Stream | null> => {
    const response = await apiClient.get<ApiResponse<Stream | null>>("/streams/active");
    return response.data.data;
  },

  getById: async (id: number): Promise<Stream> => {
    const response = await apiClient.get<ApiResponse<Stream>>(`/streams/${id}`);
    return response.data.data;
  },

  create: async (input: CreateStreamInput): Promise<Stream> => {
    const response = await apiClient.post<ApiResponse<Stream>>("/streams", input);
    return response.data.data;
  },

  end: async (id: number): Promise<Stream> => {
    const response = await apiClient.put<ApiResponse<Stream>>(`/streams/${id}/end`);
    return response.data.data;
  },

  addProduct: async (streamId: number, productCode: string): Promise<void> => {
    await apiClient.post(`/streams/${streamId}/products`, { productCode });
  },

  removeProduct: async (streamId: number, productCode: string): Promise<void> => {
    await apiClient.delete(`/streams/${streamId}/products/${productCode}`);
  },

  /** Resumen del live recién finalizado. Sin streamId usa el live activo. */
  getSummary: async (streamId?: number): Promise<LiveSummary> => {
    const path = streamId
      ? `/dashboard/summary/${streamId}`
      : "/dashboard/summary";
    const response = await apiClient.get<ApiResponse<LiveSummary>>(path);
    return response.data.data;
  },
};
