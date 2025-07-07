import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
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
  };
}
