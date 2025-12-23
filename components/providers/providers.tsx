'use client';

import { ReactNode } from 'react';
import QueryProvider from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SyncProvider } from '@/components/providers/sync-provider';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ErrorBoundary>
            <QueryProvider>
                <AuthProvider>
                    <SyncProvider>
                        {children}
                    </SyncProvider>
                    <Toaster />
                </AuthProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}
