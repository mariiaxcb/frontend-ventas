import { apiClient } from "./api.client";

export type WhatsappBotStatus = "DISCONNECTED" | "INITIALIZING" | "QR_READY" | "CONNECTED";

export interface WhatsappStatusResponse {
  status: WhatsappBotStatus;
  qr: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const whatsappApi = {
  getStatus: async (): Promise<WhatsappStatusResponse> => {
    const { data } = await apiClient.get<ApiResponse<WhatsappStatusResponse>>("/whatsapp/status");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Error al obtener el estado de WhatsApp");
    }
    return data.data;
  },

  startBot: async (): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<null>>("/whatsapp/start");
    if (!data.success) {
      throw new Error(data.message || "Error al iniciar el bot de WhatsApp");
    }
  },

  stopBot: async (): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<null>>("/whatsapp/stop");
    if (!data.success) {
      throw new Error(data.message || "Error al detener el bot de WhatsApp");
    }
  },

  restartBot: async (): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<null>>("/whatsapp/restart");
    if (!data.success) {
      throw new Error(data.message || "Error al reiniciar el bot de WhatsApp");
    }
  },
};
