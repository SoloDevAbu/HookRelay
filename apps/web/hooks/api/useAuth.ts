import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data.user;
    },
    retry: false, // Don't retry if not logged in
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await apiClient.post("/auth/signup", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}
