'use server';

import { db } from '@/db';
import { transactions, categories } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, desc } from 'drizzle-orm';

export async function getTransactions(filters?: {
    search?: string;
    from?: string; // ISO Date YYYY-MM-DD
    to?: string;   // ISO Date YYYY-MM-DD
    walletId?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    // Build the where clause
    let whereClause = eq(transactions.userId, userId);

    const result = await db
        .select({
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
        .where(whereClause)
        .orderBy(desc(transactions.date));

    // In-memory filtering
    let filtered = result;

    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
            (t.note?.toLowerCase().includes(searchLower)) ||
            (t.categoryName?.toLowerCase().includes(searchLower))
        );
    }

    if (filters?.from || filters?.to) {
        filtered = filtered.filter(t => {
            const txDate = new Date(t.date);
            // Reset time part for accurate date comparison if needed, 
            // but usually incoming from/to are YYYY-MM-DD.
            // Let's assume t.date can have time, so we compare timestamps or YYYY-MM-DD strings.
            // Safer to use timestamp comparison with set boundaries.

            let matchesFrom = true;
            let matchesTo = true;

            if (filters.from) {
                const fromDate = new Date(filters.from);
                fromDate.setHours(0, 0, 0, 0);
                matchesFrom = txDate >= fromDate;
            }

            if (filters.to) {
                const toDate = new Date(filters.to);
                toDate.setHours(23, 59, 59, 999);
                matchesTo = txDate <= toDate;
            }

            return matchesFrom && matchesTo;
        });
    }

    if (filters?.walletId && filters.walletId !== 'all') {
        filtered = filtered.filter(t => t.walletId === filters.walletId);
    }

    return filtered;
}
