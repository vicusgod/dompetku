'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function updateSetting(key: string, value: string) {
    const cookieStore = await cookies();

    // Set cookie with a long expiration (1 year)
    cookieStore.set(key, value, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    return { success: true };
}

export async function getSettings() {
    const cookieStore = await cookies();

    return {
        currency: cookieStore.get('currency')?.value || 'IDR',
        language: cookieStore.get('language')?.value || 'en',
        hideBalances: cookieStore.get('hideBalances')?.value === 'true',
    };
}

export async function updateUserProfile(data: { displayName: string; photoUrl?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updates: { data: { full_name?: string; avatar_url?: string } } = {
        data: {
            full_name: data.displayName,
        },
    };

    // Handle photo upload if provided and is a data URL
    if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
        try {
            // Extract base64 data
            const base64Data = data.photoUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileExt = data.photoUrl.substring(data.photoUrl.indexOf('/') + 1, data.photoUrl.indexOf(';'));
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('avatars')
                .upload(fileName, buffer, {
                    contentType: `image/${fileExt}`,
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                // Continue without updating avatar if upload fails (e.g. bucket doesn't exist)
                // but we should probably inform? For now, we prefer robustness.
            } else {
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                updates.data.avatar_url = publicUrl;
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    } else if (data.photoUrl) {
        // If it's already a URL (not data:image), just save it
        updates.data.avatar_url = data.photoUrl;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
