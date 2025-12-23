'use server';

import { db } from '@/db';
import { wallets } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';

export async function seedDefaultWallet(props?: { userId?: string }) {
    let userId = props?.userId;

    if (!userId) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
    }
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    const existing = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

    if (existing.length === 0) {
        await db.insert(wallets).values({
            name: 'Main Wallet',
            type: 'CASH',
            balance: '0',
            userId,
            icon: 'Wallet',
        });
        return { success: true, message: 'Default wallet created' };
    }

    return { success: true, message: 'Wallets already exist' };
}
