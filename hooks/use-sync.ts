'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { syncEngine } from '@/lib/sync-engine';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function useSync() {
    const { user, isGuest, isLoading: isAuthLoading } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [hasCompletedInitialSync, setHasCompletedInitialSync] = useState(false);
    const queryClient = useQueryClient();

    const isSyncingRef = useRef(false);
    const hasStartedRef = useRef(false);

    const runSync = useCallback(async () => {
        if (!user || isGuest) return;
        if (isSyncingRef.current) return;

        // Don't attempt sync if offline
        if (!navigator.onLine) {
            console.log('Sync skipped: offline');
            setHasCompletedInitialSync(true);
            return;
        }

        isSyncingRef.current = true;
        setIsSyncing(true);
        try {
            // Push local changes
            await syncEngine.push(user.id);

            // Pull remote changes
            await syncEngine.pull(user.id);

            setLastSynced(new Date());
            setHasCompletedInitialSync(true);
            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            // Even on failure, mark as completed so we don't show skeleton forever
            setHasCompletedInitialSync(true);
        } finally {
            setIsSyncing(false);
            isSyncingRef.current = false;
        }
    }, [user, isGuest]);

    useEffect(() => {
        // Subscribe to SyncEngine updates to refetch queries
        const unsubscribe = syncEngine.subscribe(() => {
            console.log('SyncEngine notified update. Refetching queries...');
            // Use refetchQueries instead of invalidateQueries to force immediate update
            queryClient.refetchQueries();
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);

    useEffect(() => {
        // Reset state when user changes (login/logout)
        if (!user || isGuest) {
            setHasCompletedInitialSync(isGuest); // Guests have local data immediately
            hasStartedRef.current = false;
            return;
        }

        const handleOnline = () => {
            console.log('App is back online. Syncing...');
            toast.success('Back online. Syncing data...');
            runSync();
        };

        const handleOffline = () => {
            toast.info('You are offline. Changes will be saved locally.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync on mount - only once per user session
        if (navigator.onLine && !hasStartedRef.current) {
            hasStartedRef.current = true;
            setIsSyncing(true); // Set syncing BEFORE the async call starts
            runSync();
        } else if (!navigator.onLine) {
            // If offline, mark sync as complete so we show local data (even if empty)
            setHasCompletedInitialSync(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user, isGuest, runSync]);

    return {
        isSyncing,
        lastSynced,
        hasCompletedInitialSync,
        runSync
    };
}

