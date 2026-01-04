'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60000, // 1 minute - reduce unnecessary refetches
                refetchOnWindowFocus: false, // Don't refetch when switching tabs
                refetchOnReconnect: false, // Don't refetch on reconnect
                retry: 1, // Only retry once on failure
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
