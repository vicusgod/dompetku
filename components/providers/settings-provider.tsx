'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    currency: string;
    language: string;
    hideBalances: boolean;
}

interface SettingsContextType extends Settings {
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
    children,
    initialSettings,
}: {
    children: React.ReactNode;
    initialSettings?: Settings; // Made optional
}) {
    const defaultSettings: Settings = {
        currency: 'IDR',
        language: 'en',
        hideBalances: false,
    };

    const [settings, setSettings] = useState<Settings>(initialSettings || defaultSettings);

    // Initialize from localStorage on mount (Client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dompetku-settings');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings((prev) => ({ ...prev, ...parsed }));
                } catch (e) {
                    // Ignore error
                }
            } else if (initialSettings) {
                // If no local storage but we have server initialSettings, save them locally
                localStorage.setItem('dompetku-settings', JSON.stringify(initialSettings));
            }
        }
    }, []);

    // Sync state with props if they change (server refresh)
    useEffect(() => {
        if (initialSettings) {
            setSettings((prev) => {
                const updated = { ...prev, ...initialSettings };
                // Also update local storage to keep in sync
                localStorage.setItem('dompetku-settings', JSON.stringify(updated));
                return updated;
            });
        }
    }, [initialSettings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('dompetku-settings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ ...settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
