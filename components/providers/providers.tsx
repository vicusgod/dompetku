'use client';

import { ReactNode, useEffect } from 'react';
import QueryProvider from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SyncProvider } from '@/components/providers/sync-provider';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // Global error handlers to prevent crashes
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('Global error caught:', event.error);
            // Prevent the error from crashing the app
            event.preventDefault();
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Check if it's a network error
            if (event.reason?.message?.includes('fetch') ||
                event.reason?.message?.includes('network') ||
                event.reason?.message?.includes('Failed to fetch')) {
                console.log('Network error suppressed - app is offline');
            }
            // Prevent the error from crashing the app
            event.preventDefault();
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

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

