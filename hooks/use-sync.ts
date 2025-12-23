'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { syncEngine } from '@/lib/sync-engine';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function useSync() {
    const { user, isGuest } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const queryClient = useQueryClient();

    const isSyncingRef = useRef(false);

    const runSync = useCallback(async () => {
        if (!user || isGuest) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        setIsSyncing(true);
        try {
            // Push local changes
            await syncEngine.push(user.id);

            // Pull remote changes
            await syncEngine.pull(user.id);

            setLastSynced(new Date());
            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            // Don't toast for background sync failures usually, unless critical
        } finally {
            setIsSyncing(false);
            isSyncingRef.current = false;
        }
    }, [user, isGuest]); // Removed isSyncing dependency

    useEffect(() => {
        // Subscribe to SyncEngine updates to invalidate queries
        const unsubscribe = syncEngine.subscribe(() => {
            console.log('SyncEngine notified update. Invalidating queries...');
            queryClient.invalidateQueries();
            // We can be more specific: ['transactions'], ['wallets'], etc.
            // But invalidating all is safer for now.
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);

    useEffect(() => {
        if (!user || isGuest) return;

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

        // Initial sync on mount
        if (navigator.onLine) {
            runSync();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user, isGuest, runSync]);

    return {
        isSyncing,
        lastSynced,
        runSync
    };
}
