import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Event, Delivery } from "@hookrelay/db";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useEvents(tenantId: string, params: { page?: number; limit?: number; eventType?: string } = {}) {
  return useQuery({
    queryKey: ["events", tenantId, params],
    queryFn: async () => {
      const response = await apiClient.get<{ events: Event[]; pagination: PaginationInfo }>(
        `/tenants/${tenantId}/events`,
        { params }
      );
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useEvent(tenantId: string, eventId: string) {
  return useQuery({
    queryKey: ["event", tenantId, eventId],
    queryFn: async () => {
      const response = await apiClient.get<{ event: Event; deliveries: Delivery[] }>(
        `/tenants/${tenantId}/events/${eventId}`
      );
      return response.data;
    },
    enabled: !!tenantId && !!eventId,
  });
}

export function useReplayEvent(tenantId: string) {
  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiClient.post(`/admin/events/${eventId}/replay`);
      return response.data;
    },
  });
}
