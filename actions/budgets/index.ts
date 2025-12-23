'use server';

import { db } from '@/db';
import { budgets, categories, transactions } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const budgetSchema = z.object({
    categoryId: z.string().uuid('Invalid category'),
    amount: z.coerce.number().positive('Amount must be positive'),
    period: z.enum(['MONTHLY']),
});

export async function getBudgets() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    try {
        const result = await db
            .select({
                id: budgets.id,
                amount: budgets.amount,
                period: budgets.period,
                categoryId: budgets.categoryId,
                categoryName: categories.name,
                categoryType: categories.type,
                spent: sql<number>`(
                    SELECT COALESCE(SUM(${transactions.amount}), 0)
                    FROM ${transactions}
                    WHERE ${transactions.categoryId} = ${budgets.categoryId}
                    AND ${transactions.userId} = ${userId}
                    AND ${transactions.type} = 'EXPENSE'
                    AND ${transactions.date} >= ${startOfMonth.toISOString()}
                    AND ${transactions.date} <= ${endOfMonth.toISOString()}
                )`.mapWith(Number),
            })
            .from(budgets)
            .leftJoin(categories, eq(budgets.categoryId, categories.id))
            .where(eq(budgets.userId, userId))
            .orderBy(desc(budgets.createdAt));

        return result;
    } catch (error) {
        console.error('Failed to fetch budgets:', error);
        return [];
    }
}

export async function createBudget(data: unknown) {
    const supabase = await createClient();
    const budgetSchema = z.object({
        id: z.string().uuid().optional(),
        categoryId: z.string().uuid('Invalid category'),
        amount: z.coerce.number().positive('Amount must be positive'),
        period: z.enum(['MONTHLY']),
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    const result = budgetSchema.safeParse(data);
    if (!result.success) {
        return { error: 'Invalid data' };
    }

    const { id, categoryId, amount, period } = result.data;

    try {
        // Check if budget for category already exists
        const existing = await db.query.budgets.findFirst({
            where: and(
                eq(budgets.categoryId, categoryId),
                eq(budgets.userId, userId)
            )
        });

        if (existing) {
            return { error: 'Budget for this category already exists' };
        }

        await db.insert(budgets).values({
            id: id, // Use provided ID if available
            categoryId,
            amount: amount.toString(),
            period,
            userId,
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/budget');
        return { success: true };
    } catch (error) {
        console.error('Create Budget Error:', error);
        return { error: 'Failed to create budget' };
    }
}

export async function deleteBudget(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
        userId = '11111111-1111-1111-1111-111111111111'; // Demo User
    }

    try {
        const existing = await db.query.budgets.findFirst({
            where: and(eq(budgets.id, id), eq(budgets.userId, userId))
        });

        if (!existing) return { error: 'Budget not found' };

        await db.delete(budgets).where(eq(budgets.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/budget');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete budget' };
    }
}
