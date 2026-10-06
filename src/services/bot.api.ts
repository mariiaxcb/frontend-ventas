const BOT_API_URL =
  process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:3111";

export type BotStatus =
  | "CONNECTED"
  | "QR_READY"
  | "INITIALIZING"
  | "DISCONNECTED";

export interface BotSessionState {
  status: BotStatus;
  qr: string | null;
  phoneNumber: string | null;
  updatedAt: string;
}

/**
 * La sesión de WhatsApp vive en el proceso del bot, no en la API: por eso este
 * cliente habla directamente con la API HTTP que expone el bot.
 */
export const botApi = {
  getStatus: async (): Promise<BotSessionState> => {
    const response = await fetch(`${BOT_API_URL}/status`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("No se pudo consultar el estado del bot");
    }

    return response.json();
  },

  /** Pide un QR nuevo cuando el bot se quedó sin él. */
  connect: async (): Promise<void> => {
    const response = await fetch(`${BOT_API_URL}/connect`, { method: "POST" });

    if (!response.ok) {
      throw new Error("No se pudo pedir una nueva conexión al bot");
    }
  },

  /** Cierra la sesión del dispositivo y borra las credenciales locales. */
  logout: async (): Promise<void> => {
    const response = await fetch(`${BOT_API_URL}/logout`, { method: "POST" });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "No se pudo cerrar la sesión de WhatsApp");
    }
  },
};