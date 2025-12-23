'use server';

import { db } from '@/db';
import { transactions, wallets } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { transactionSchema as originalTransactionSchema } from '@/lib/validators'; // Renamed to avoid conflict
import { revalidatePath } from 'next/cache';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod'; // Added import for zod

export async function createTransaction(data: unknown) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    // Redefine transactionSchema locally to include walletId and optional ID for sync
    const transactionSchema = z.object({
        id: z.string().uuid().optional(),
        amount: z.coerce.number().positive('Amount must be positive'),
        type: z.enum(['INCOME', 'EXPENSE']),
        categoryId: z.string().uuid('Invalid category'),
        walletId: z.string().uuid('Invalid wallet').optional(),
        date: z.coerce.date(),
        note: z.string().optional(),
    });

    const result = transactionSchema.safeParse(data);

    if (!result.success) {
        return { error: 'Invalid data' };
    }

    const { id, amount, type, categoryId, walletId, date, note } = result.data;

    try {
        // If walletId is provided, verify it belongs to user
        if (walletId) {
            const wallet = await db.query.wallets.findFirst({
                where: and(eq(wallets.id, walletId), eq(wallets.userId, userId))
            });
            if (!wallet) return { error: 'Invalid wallet' };
        }

        await db.insert(transactions).values({
            id: id, // Use provided ID if available (from offline sync)
            amount: amount.toString(), // Drizzle handles decimal as string
            type,
            categoryId,
            walletId, // Added walletId
            userId: userId,
            date,
            note,
        });

        // Update wallet balance if walletId is present
        if (walletId) {
            const balanceChange = type === 'INCOME' ? amount : -amount;
            await db.execute(sql`
                UPDATE ${wallets}
                SET balance = balance + ${balanceChange.toString()}
                WHERE id = ${walletId}
            `);
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        revalidatePath('/dashboard/wallets');
        return { success: true };
    } catch (error) {
        console.error('Create Transaction Error:', error);
        return { error: `Failed to create transaction: ${(error as Error).message}` };
    }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    try {
        const transaction = await db.query.transactions.findFirst({
            where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
        });

        if (!transaction) return { error: 'Transaction not found' };

        // Revert wallet balance if walletId is present
        if (transaction.walletId) {
            const amount = parseFloat(transaction.amount);
            const balanceChange = transaction.type === 'INCOME' ? -amount : amount; // Reverse the effect
            await db.execute(sql`
                UPDATE ${wallets}
                SET balance = balance + ${balanceChange.toString()}
                WHERE id = ${transaction.walletId}
            `);
        }

        await db.delete(transactions).where(eq(transactions.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        revalidatePath('/dashboard/wallets');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete transaction' };
    }
}

export async function updateTransaction(id: string, data: unknown) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    // Redefine transactionSchema locally for update
    const transactionSchema = z.object({
        amount: z.coerce.number().positive('Amount must be positive'),
        type: z.enum(['INCOME', 'EXPENSE']),
        categoryId: z.string().uuid('Invalid category'),
        date: z.coerce.date(),
        note: z.string().optional(),
    });

    const result = transactionSchema.safeParse(data);

    if (!result.success) {
        return { error: 'Invalid data' };
    }

    const { amount, type, categoryId, date, note } = result.data;

    try {
        // Verify ownership
        const existing = await db
            .select({ userId: transactions.userId })
            .from(transactions)
            .where(eq(transactions.id, id))
            .limit(1)
            .then(res => res[0]);

        if (!existing || existing.userId !== userId) {
            return { error: 'Unauthorized' };
        }

        await db.update(transactions).set({
            amount: amount.toString(),
            type,
            categoryId,
            date,
            note,
        }).where(eq(transactions.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to update transaction' };
    }
}
