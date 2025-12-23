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
    initialSettings: Settings;
}) {
    const [settings, setSettings] = useState(initialSettings);

    // Sync state with props if they change (e.g. after router.refresh())
    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
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
