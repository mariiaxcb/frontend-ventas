import { apiClient } from "./api.client";

export interface Stream {
  id: number;
  title: string;
  tiktokUsername: string;
  startDate: string;
  endDate?: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  adminId: number;
}

export interface CreateStreamInput {
  title: string;
  tiktokUsername: string;
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
};
