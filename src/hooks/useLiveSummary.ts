"use client";

import { useQuery } from "@tanstack/react-query";
import { streamsApi, type LiveSummary } from "@/services/streams.api";

export const LIVE_SUMMARY_QUERY_KEY = ["live-summary"] as const;

/**
 * Carga el resumen de un live finalizado.
 * @param streamId ID del live. Si se omite, el backend usa el live activo.
 */
export function useLiveSummary(streamId?: number) {
  return useQuery<LiveSummary>({
    queryKey: streamId
      ? [...LIVE_SUMMARY_QUERY_KEY, streamId]
      : LIVE_SUMMARY_QUERY_KEY,
    queryFn: () => streamsApi.getSummary(streamId),
    // El resumen es un cierre contable: no queremos refetch automáticos.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}