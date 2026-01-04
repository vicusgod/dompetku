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
        const startTime = performance.now();
        console.log('[Auth] Starting auth check...');

        // Check if guest cookie exists
        const guestCookie = Cookies.get(GUEST_COOKIE);
        if (guestCookie === 'true') {
            setIsGuest(true);
            LocalDataStore.initialize(); // Initialize local data for guest
            console.log('[Auth] Guest mode detected');
        }

        // Check Supabase Auth - use getSession first (faster, from local storage)
        // then validate with getUser if needed
        const checkUser = async () => {
            try {
                // Step 1: Fast check from local session (no network call)
                const sessionStart = performance.now();
                const { data: { session } } = await supabase.auth.getSession();
                console.log(`[Auth] getSession took ${(performance.now() - sessionStart).toFixed(0)}ms`);

                if (session?.user) {
                    // We have a cached session, use it immediately
                    setUser(session.user);
                    LocalDataStore.setUserId(session.user.id);
                    setIsLoading(false);
                    console.log(`[Auth] User loaded from session in ${(performance.now() - startTime).toFixed(0)}ms`);

                    // Optional: Validate session in background (non-blocking)
                    supabase.auth.getUser().then(({ data: { user: validatedUser } }) => {
                        if (validatedUser) {
                            setUser(validatedUser);
                        } else {
                            // Session invalid, clear user
                            setUser(null);
                            LocalDataStore.setUserId(null);
                        }
                    });
                } else {
                    // No session, try getUser as fallback
                    const userStart = performance.now();
                    const { data: { user } } = await supabase.auth.getUser();
                    console.log(`[Auth] getUser took ${(performance.now() - userStart).toFixed(0)}ms`);
                    setUser(user);
                    LocalDataStore.setUserId(user?.id || null);
                    setIsLoading(false);
                    console.log(`[Auth] Auth check complete in ${(performance.now() - startTime).toFixed(0)}ms`);
                }
            } catch (error) {
                console.error('[Auth] Error:', error);
                setIsLoading(false);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            LocalDataStore.setUserId(newUser?.id || null);
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
