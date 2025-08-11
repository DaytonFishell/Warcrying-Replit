import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false,
    refetchIntervalInBackground: false,
    enabled: !hasTriedAuth, // Only run once
  });

  useEffect(() => {
    if (!isLoading && (user || error)) {
      setHasTriedAuth(true);
    }
  }, [isLoading, user, error]);

  return {
    user,
    isLoading: !hasTriedAuth && isLoading,
    error,
    isAuthenticated: !!user && !error,
  };
}