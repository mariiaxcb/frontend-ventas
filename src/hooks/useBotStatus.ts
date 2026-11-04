"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { botApi, type BotSessionState } from "@/services/bot.api";

const BOT_STATUS_KEY = ["bot", "status"] as const;

/**
 * Estado de la sesión de WhatsApp.
 *
 * `retry: false` a propósito: si el bot está apagado no queremos insistir con
 * reintentos, sino mostrarle al vendedor que debe iniciarlo.
 */
export function useBotStatus(options?: { enabled?: boolean }) {
  return useQuery<BotSessionState>({
    queryKey: BOT_STATUS_KEY,
    queryFn: botApi.getStatus,
    enabled: options?.enabled ?? true,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Mientras haya un QR por escanear o una conexión en curso, vigilamos
      // más seguido para que el panel reaccione sin recargar.
      return status === "CONNECTED" ? 10000 : 3000;
    },
    retry: false,
    staleTime: 2000,
  });
}

export function useBotLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => botApi.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOT_STATUS_KEY });
    },
  });
}

/**
 * Pide un QR nuevo al bot.
 *
 * El QR no viene en la respuesta: WhatsApp lo emite de forma asíncrona tras
 * abrir la conexión. Por eso, además de invalidar la consulta, forzamos
 * reintentos cortos durante los primeros segundos. Si solo invalidiéramos una
 * vez, el vendedor vería "generando QR" hasta el siguiente sondeo y allí
 * aparecería el código.
 */
export function useBotConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => botApi.connect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOT_STATUS_KEY });

      // El QR suele llegar entre 1 y 4 segundos. Sondeamos varias veces en
      // esa ventana para que aparezca sin que el vendedor recargue.
      [1000, 2500, 4000].forEach((ms) => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: BOT_STATUS_KEY });
        }, ms);
      });
    },
  });
}