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
            LocalDataStore.initialize();
        }

        // Check Supabase Auth
        const checkUser = async () => {
            try {
                // 1. Try to get session from local storage (fast, works offline)
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    LocalDataStore.setUserId(session.user.id);
                }

                // 2. Unblock UI immediately so we can load cached data
                setIsLoading(false);

                // 3. Only verify with server if online
                if (navigator.onLine) {
                    try {
                        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
                        if (verifiedUser && verifiedUser.id !== session?.user?.id) {
                            setUser(verifiedUser);
                            LocalDataStore.setUserId(verifiedUser.id);
                        }
                    } catch (verifyError) {
                        // Silently fail - we already have session data
                        console.warn('User verification failed (offline?):', verifyError);
                    }
                }
            } catch (error) {
                console.error('Auth check failed', error);
                setIsLoading(false);
            }
        };
        checkUser();

        // Auth state change listener with error handling
        let subscription: { unsubscribe: () => void } | null = null;

        try {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                try {
                    const newUser = session?.user ?? null;
                    setUser(newUser);
                    LocalDataStore.setUserId(newUser?.id || null);

                    if (newUser) {
                        setIsGuest(false);
                        Cookies.remove(GUEST_COOKIE);
                    }
                } catch (stateError) {
                    console.error('Error in auth state change handler:', stateError);
                }
            });
            subscription = data.subscription;
        } catch (subscriptionError) {
            console.error('Failed to setup auth subscription:', subscriptionError);
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
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
