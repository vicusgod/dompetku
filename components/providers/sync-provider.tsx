'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSync as useSyncHook } from '@/hooks/use-sync';

const SyncContext = createContext<ReturnType<typeof useSyncHook> | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
    const sync = useSyncHook();

    return (
        <SyncContext.Provider value={sync}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSyncState = () => {
    const context = useContext(SyncContext);
    if (!context) {
        // If used outside provider, return default/dummy values or throw
        // Since it might be used in components rendered before SyncProvider is mounted (rare), 
        // let's safe guard or throw.
        throw new Error('useSyncState must be used within SyncProvider');
    }
    return context;
};
