import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Tenant } from "@hookrelay/db";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const response = await apiClient.get<{ tenants: Tenant[] }>("/tenants");
      return response.data.tenants;
    },
  });
}

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: async () => {
      const response = await apiClient.get<{ tenant: Tenant }>(`/tenants/${tenantId}`);
      return response.data.tenant;
    },
    enabled: !!tenantId,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; rateLimitPerMin?: number }) => {
      const response = await apiClient.post<{ tenant: Tenant; apiKey: string; warning: string }>("/tenants", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useRotateApiKey(tenantId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{ apiKey: string; warning: string }>(`/tenants/${tenantId}/rotate-key`);
      return response.data;
    },
  });
}
