import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { logout, refreshAuthToken } from "@/lib/authUtils";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  timezone?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Mutation to update user timezone
  const updateTimezoneMutation = useMutation({
    mutationFn: async (timezone: string) => {
      return await apiRequest('PATCH', '/api/auth/user/timezone', { timezone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  // Mutation to logout
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Mutation to refresh auth token
  const refreshTokenMutation = useMutation({
    mutationFn: refreshAuthToken,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
  });

  // Auto-detect and set user timezone on first login
  useEffect(() => {
    if (user && !user.timezone) {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      updateTimezoneMutation.mutate(detectedTimezone);
    }
  }, [user, updateTimezoneMutation]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    updateTimezone: updateTimezoneMutation.mutate,
    isUpdatingTimezone: updateTimezoneMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refreshToken: refreshTokenMutation.mutate,
    isRefreshingToken: refreshTokenMutation.isPending,
  };
}
