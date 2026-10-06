import { apiClient } from "./api.client";

export type WhatsappBotStatus = "CONNECTED" | "DISCONNECTED" | "QR_READY" | "INITIALIZING";

export interface BotStatusResponse {
  status: WhatsappBotStatus;
  qr?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const whatsappApi = {
  getStatus: async (): Promise<BotStatusResponse> => {
    const response = await apiClient.get<ApiResponse<BotStatusResponse>>("/whatsapp/status");
    return response.data.data;
  },

  startBot: async (): Promise<void> => {
    await apiClient.post("/whatsapp/start");
  },

  stopBot: async (): Promise<void> => {
    await apiClient.post("/whatsapp/stop");
  },

  restartBot: async (): Promise<void> => {
    await apiClient.post("/whatsapp/restart");
  },
};
