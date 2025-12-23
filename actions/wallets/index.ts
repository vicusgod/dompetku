'use server';

import { db } from '@/db';
import { wallets } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, inArray, sql, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function reorderWallets(items: { id: string; order: number }[]) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Fallback for Demo/Dev
    }

    try {
        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(wallets)
                    .set({ order: item.order })
                    .where(eq(wallets.id, item.id));
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to reorder wallets:', error);
        return { success: false, error: 'Failed to reorder wallets' };
    }
}

export async function getWallets() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111';
    }

    try {
        const userWallets = await db
            .select()
            .from(wallets)
            .where(eq(wallets.userId, userId))
            .orderBy(asc(wallets.order));

        return userWallets;
    } catch (error) {
        console.error('Failed to fetch wallets:', error);
        return [];
    }
}

export async function createWallet(data: { id?: string; name: string; type: 'CASH' | 'BANK' | 'E_WALLET'; balance: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || '11111111-1111-1111-1111-111111111111';

    try {
        await db.insert(wallets).values({
            id: data.id, // Use provided ID from offline creation
            name: data.name,
            type: data.type,
            balance: data.balance.toString(),
            userId: userId,
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/wallets');
        return { success: true };
    } catch (error) {
        console.error('Failed to create wallet:', error);
        return { success: false, error: 'Failed to create wallet' };
    }
}

export async function deleteWallet(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111';
    }

    try {
        await db.delete(wallets).where(eq(wallets.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/wallets');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete wallet:', error);
        return { success: false, error: 'Failed to delete wallet' };
    }
}

export async function updateWallet(id: string, data: { name: string; type: 'CASH' | 'BANK' | 'E_WALLET'; balance: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111';
    }

    try {
        await db.update(wallets)
            .set({
                name: data.name,
                type: data.type,
                balance: data.balance.toString(),
            })
            .where(eq(wallets.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/wallets');
        return { success: true };
    } catch (error) {
        console.error('Failed to update wallet:', error);
        return { success: false, error: 'Failed to update wallet' };
    }
}
