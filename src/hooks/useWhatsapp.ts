"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappApi } from "@/services/whatsapp.api";

const QUERY_KEYS = {
  status: ["whatsapp", "status"] as const,
};

export function useWhatsappStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.status,
    queryFn: whatsappApi.getStatus,
    refetchInterval: 5000, // Refetch cada 5 segundos
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => whatsappApi.startBot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status });
    },
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => whatsappApi.stopBot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status });
    },
  });
}

export function useRestartBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => whatsappApi.restartBot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status });
    },
  });
}
