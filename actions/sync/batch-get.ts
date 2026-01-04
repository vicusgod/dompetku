'use server';

import { db } from '@/db';
import { transactions, wallets, categories, budgets } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

export interface BatchSyncData {
    transactions: Array<{
        id: string;
        amount: string;
        type: 'INCOME' | 'EXPENSE';
        date: Date;
        note: string | null;
        categoryName: string | null;
        categoryIcon: string | null;
        walletId: string;
    }>;
    wallets: Array<{
        id: string;
        name: string;
        type: 'CASH' | 'BANK' | 'E_WALLET';
        balance: string;
        order: number;
        userId: string;
        createdAt: Date;
    }>;
    categories: Array<{
        id: string;
        name: string;
        type: 'INCOME' | 'EXPENSE';
        icon: string | null;
        userId: string | null;
        createdAt: Date;
    }>;
    budgets: Array<{
        id: string;
        categoryId: string;
        amount: number;
        period: 'MONTHLY';
        createdAt: Date;
    }>;
}

/**
 * Batch fetch all sync data with a SINGLE auth call.
 * This is optimized for sync-engine to reduce auth overhead.
 */
export async function getBatchSyncData(options?: {
    transactionLimit?: number
}): Promise<BatchSyncData> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || '11111111-1111-1111-1111-111111111111';
    const limit = options?.transactionLimit ?? 500;

    // Single auth, parallel queries
    const [
        txResult,
        walletResult,
        categoryResult,
        budgetResult
    ] = await Promise.all([
        // Transactions with category join
        db.select({
            id: transactions.id,
            amount: transactions.amount,
            type: transactions.type,
            date: transactions.date,
            note: transactions.note,
            categoryName: categories.name,
            categoryIcon: categories.icon,
            walletId: transactions.walletId,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(eq(transactions.userId, userId))
            .orderBy(desc(transactions.date))
            .limit(limit),

        // Wallets
        db.select()
            .from(wallets)
            .where(eq(wallets.userId, userId))
            .orderBy(asc(wallets.order)),

        // Categories
        db.select()
            .from(categories)
            .where(eq(categories.userId, userId)),

        // Budgets (simplified without spent calculation for sync)
        db.select({
            id: budgets.id,
            categoryId: budgets.categoryId,
            amount: budgets.amount,
            period: budgets.period,
            createdAt: budgets.createdAt,
        })
            .from(budgets)
            .where(eq(budgets.userId, userId))
    ]);

    return {
        transactions: txResult as BatchSyncData['transactions'],
        wallets: walletResult as BatchSyncData['wallets'],
        categories: categoryResult,
        budgets: budgetResult.map(b => ({
            ...b,
            amount: Number(b.amount)
        }))
    };
}
