"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/dashboard.api";

const QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
  recentOrders: ["dashboard", "recent-orders"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: dashboardApi.getStats,
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: QUERY_KEYS.recentOrders,
    queryFn: () => dashboardApi.getRecentOrders(limit),
  });
}
