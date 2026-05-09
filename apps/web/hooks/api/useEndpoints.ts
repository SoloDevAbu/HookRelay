import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Endpoint } from "@hookrelay/db";

export function useEndpoints(tenantId: string) {
  return useQuery({
    queryKey: ["endpoints", tenantId],
    queryFn: async () => {
      const response = await apiClient.get<{ endpoints: Endpoint[] }>(`/tenants/${tenantId}/endpoints`);
      return response.data.endpoints;
    },
    enabled: !!tenantId,
  });
}

export function useCreateEndpoint(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { url: string; eventTypeFilter?: string[] | null; customHeaders?: Record<string, string> }) => {
      const response = await apiClient.post<{ endpoint: Endpoint }>(`/tenants/${tenantId}/endpoints`, data);
      return response.data.endpoint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tenantId] });
    },
  });
}

export function useDeleteEndpoint(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (endpointId: string) => {
      const response = await apiClient.delete(`/tenants/${tenantId}/endpoints/${endpointId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tenantId] });
    },
  });
}

export function useResetCircuitBreaker(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (endpointId: string) => {
      const response = await apiClient.post(`/admin/endpoints/${endpointId}/reset-circuit`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tenantId] });
    },
  });
}
