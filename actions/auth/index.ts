'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}

export async function signup(formData: FormData) {
    const headersList = await headers();
    const origin = headersList.get('origin') || headersList.get('referer')?.replace(/\/signup$/, '') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.session) {
        // User is auto-confirmed (or email confirmation disabled)
        // We need to seed the wallet here since callback won't be hit
        const { seedDefaultWallet } = await import('@/actions/wallets/seed');
        const { seedDefaultCategories } = await import('@/actions/categories/seed');
        await seedDefaultWallet({ userId: data.session.user.id });
        await seedDefaultCategories({ userId: data.session.user.id });
        redirect('/dashboard');
    }

    return { message: 'Check email to continue sign in process' };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
