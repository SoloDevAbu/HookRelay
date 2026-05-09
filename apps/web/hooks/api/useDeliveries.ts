import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Delivery, DeliveryAttempt } from "@hookrelay/db";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useDeliveries(tenantId: string, params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["deliveries", tenantId, params],
    queryFn: async () => {
      const response = await apiClient.get<{ deliveries: Delivery[]; pagination: PaginationInfo }>(
        `/tenants/${tenantId}/deliveries`,
        { params }
      );
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useDelivery(tenantId: string, deliveryId: string) {
  return useQuery({
    queryKey: ["delivery", tenantId, deliveryId],
    queryFn: async () => {
      const response = await apiClient.get<{ delivery: Delivery; attempts: DeliveryAttempt[] }>(
        `/tenants/${tenantId}/deliveries/${deliveryId}`
      );
      return response.data;
    },
    enabled: !!tenantId && !!deliveryId,
  });
}

export function useRetryDelivery(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId: string) => {
      const response = await apiClient.post(`/admin/deliveries/${deliveryId}/retry`);
      return response.data;
    },
    onSuccess: (_, deliveryId) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["delivery", tenantId, deliveryId] });
    },
  });
}
