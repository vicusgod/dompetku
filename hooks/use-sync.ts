'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { syncEngine } from '@/lib/sync-engine';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useSync() {
    // Use local state for user instead of context to avoid propagation issues
    const [userId, setUserId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const queryClient = useQueryClient();
    const supabaseRef = useRef(createClient());

    // DEBUG: Log every render
    console.log('[useSync] Render - userId:', userId);

    const isSyncingRef = useRef(false);
    const userIdRef = useRef<string | null>(null);
    userIdRef.current = userId;

    // Listen for auth changes directly from Supabase
    useEffect(() => {
        console.log('[useSync] Setting up auth listener');
        const supabase = supabaseRef.current;

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const id = session?.user?.id ?? null;
            console.log('[useSync] Initial session user:', id);
            setUserId(id);
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const id = session?.user?.id ?? null;
            console.log('[useSync] Auth state changed - user:', id);
            setUserId(id);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const runSync = useCallback(async () => {
        const currentUserId = userIdRef.current;
        if (!currentUserId) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        setIsSyncing(true);
        try {
            await syncEngine.push(currentUserId);
            await syncEngine.pull(currentUserId);
            setLastSynced(new Date());
            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
            isSyncingRef.current = false;
        }
    }, []);

    // Debounced sync for Realtime events
    const debouncedSyncRef = useRef<NodeJS.Timeout | null>(null);
    const runSyncRef = useRef(runSync);
    runSyncRef.current = runSync;

    const triggerDebouncedSync = useCallback(() => {
        if (debouncedSyncRef.current) {
            clearTimeout(debouncedSyncRef.current);
        }
        debouncedSyncRef.current = setTimeout(() => {
            console.log('Debounced sync triggered');
            runSyncRef.current();
        }, 2000);
    }, []);

    // Subscribe to SyncEngine updates
    useEffect(() => {
        const unsubscribe = syncEngine.subscribe(() => {
            console.log('SyncEngine notified update. Invalidating queries...');
            queryClient.invalidateQueries();
        });
        return () => unsubscribe();
    }, [queryClient]);

    // Realtime Subscription - triggers when userId is set
    useEffect(() => {
        if (!userId) {
            console.log('[useSync] No userId, skipping realtime setup');
            return;
        }

        console.log('[useSync] Setting up Realtime subscription for:', userId);
        const supabase = supabaseRef.current;

        const channel = supabase.channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
                () => triggerDebouncedSync()
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` },
                () => triggerDebouncedSync()
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
                () => triggerDebouncedSync()
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` },
                () => triggerDebouncedSync()
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime subscription active');
                }
            });

        return () => {
            console.log('Cleaning up Realtime subscription');
            supabase.removeChannel(channel);
        };
    }, [userId, triggerDebouncedSync]);

    // Online/Offline handlers
    useEffect(() => {
        if (!userId) return;

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

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [userId, runSync]);

    return {
        isSyncing,
        lastSynced,
        runSync
    };
}
