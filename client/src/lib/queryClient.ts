import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
          headers: {
            'Cache-Control': 'public, max-age=300', // Cache successful responses for 5 minutes
          }
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`Server Error: ${res.status} - ${res.statusText}`);
          }
          const errorText = await res.text();
          throw new Error(`${res.status}: ${errorText}`);
        }

        return res.json();
      },
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnection
      retry: (failureCount, error) => {
        // Only retry server errors, not client errors
        if (error instanceof Error && error.message.includes('Server Error')) {
          return failureCount < 3;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Add global cache invalidation helper
export const invalidateQueries = async (queryKey: string) => {
  await queryClient.invalidateQueries({ queryKey: [queryKey] });
};

// Add optimistic update helper
export const optimisticUpdate = <T>(
  queryKey: string,
  updateFn: (oldData: T) => T
) => {
  queryClient.setQueryData([queryKey], (oldData: T) => updateFn(oldData));
};