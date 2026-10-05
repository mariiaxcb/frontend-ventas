"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streamsApi, type CreateStreamInput } from "@/services/streams.api";

const QUERY_KEYS = {
  streams: ["streams"] as const,
  activeStream: ["streams", "active"] as const,
};

export function useStreams() {
  return useQuery({
    queryKey: QUERY_KEYS.streams,
    queryFn: streamsApi.list,
  });
}

export function useStreamSummary(streamId?: number) {
  return useQuery({
    queryKey: ["stream-summary", streamId ?? "active"],
    queryFn: () => streamsApi.getSummary(streamId),
    enabled: streamId != null,
  });
}

export function useActiveStream() {
  return useQuery({
    queryKey: QUERY_KEYS.activeStream,
    queryFn: streamsApi.getActive,
  });
}

export function useCreateStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStreamInput) => streamsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeStream });
    },
  });
}

export function useEndStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => streamsApi.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeStream });
    },
  });
}
