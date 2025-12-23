'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { LocalDataStore } from '@/lib/local-store';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isGuest: boolean;
    isLoading: boolean;
    loginAsGuest: () => void;
    logoutGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_COOKIE = 'duit-guest-mode';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Check if guest cookie exists
        const guestCookie = Cookies.get(GUEST_COOKIE);
        if (guestCookie === 'true') {
            setIsGuest(true);
            LocalDataStore.initialize(); // Initialize local data for guest
        }

        // Check Supabase Auth
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            LocalDataStore.setUserId(user?.id || null); // Set ID
            setIsLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            LocalDataStore.setUserId(newUser?.id || null); // Set ID
            // If logged in via Supabase, ensure Guest mode is off?
            if (newUser) {
                // If we were in guest mode, maybe we should merge data? 
                // For now, let's just prioritize Auth User.
                // But SyncEngine needs to know.
                // If user logs in, we might want to keep isGuest false.
                setIsGuest(false);
                Cookies.remove(GUEST_COOKIE);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loginAsGuest = () => {
        Cookies.set(GUEST_COOKIE, 'true', { expires: 365 }); // 1 year
        LocalDataStore.initialize();
        setIsGuest(true);
        setUser(null); // Clear auth user if any
        window.location.href = '/dashboard';
    };

    const logoutGuest = () => {
        Cookies.remove(GUEST_COOKIE);
        LocalDataStore.clear();
        setIsGuest(false);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, isGuest, isLoading, loginAsGuest, logoutGuest }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
