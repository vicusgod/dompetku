'use server';

import { db } from '@/db';
import { transactions, categories, wallets as walletsTable } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, desc, asc } from 'drizzle-orm';

import { getBudgets } from '@/actions/budgets';

export async function getDashboardStats() {
    // ... (existing setup) ...
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;

    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Calculate Balance (All time)
    let totalBalance = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let recentTransactions: any[] = [];

    try {
        const allTransactions = await db
            .select({
                amount: transactions.amount,
                type: transactions.type,
                date: transactions.date,
            })
            .from(transactions)
            .where(eq(transactions.userId, userId));

        allTransactions.forEach((t) => {
            const amount = parseFloat(t.amount);
            if (t.type === 'INCOME') {
                totalBalance += amount;
                if (t.date >= firstDayOfMonth) monthIncome += amount;
            } else {
                totalBalance -= amount;
                if (t.date >= firstDayOfMonth) monthExpense += amount;
            }
        });

        // 2. Recent Transactions (Top 5)
        recentTransactions = await db
            .select({
                id: transactions.id,
                amount: transactions.amount,
                type: transactions.type,
                date: transactions.date,
                categoryName: categories.name,
            })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(eq(transactions.userId, userId))
            .orderBy(desc(transactions.date))
            .limit(5);

    } catch (error) {
        console.error('Failed to fetch transactions:', error);
    }

    // 3. Chart Data (Expenses by Category for Current Month)
    let chartData: { name: string; value: number }[] = [];
    try {
        const expenseMap = new Map<string, number>();

        const rawChartData = await db
            .select({
                amount: transactions.amount,
                categoryName: categories.name,
                type: transactions.type,
                date: transactions.date,
            })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(eq(transactions.userId, userId));

        rawChartData.forEach(t => {
            if (t.type === 'EXPENSE' && t.date >= firstDayOfMonth) {
                const cat = t.categoryName || 'Uncategorized';
                const val = parseFloat(t.amount);
                expenseMap.set(cat, (expenseMap.get(cat) || 0) + val);
            }
        });

        chartData = Array.from(expenseMap.entries()).map(([name, value]) => ({
            name,
            value
        }));
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        chartData = [];
    }


    // 4. Budgets
    const budgets = await getBudgets();

    // 5. Wallets
    // 5. Wallets
    let wallets: any[] = [];
    try {
        wallets = await db
            .select()
            .from(walletsTable)
            .where(eq(walletsTable.userId, userId))
            .orderBy(asc(walletsTable.order));
    } catch (error) {
        console.error('Failed to fetch wallets:', error);
        wallets = [];
    }

    return {
        balance: totalBalance,
        income: monthIncome,
        expense: monthExpense,
        recentTransactions,
        chartData,
        budgets,
        wallets
    };
}
