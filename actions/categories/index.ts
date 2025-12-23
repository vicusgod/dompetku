'use server';

import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // Fetch default categories (userId is null) AND user's custom categories
    // For simplicity in this mvp, we might have seeded defaults with the user's ID or left them null.
    // Based on previous seeding, defaults might have specific IDs.
    // Let's assume we fetch all categories for the user.

    // Check if we are using a shared default system or per-user.
    // The schema usually has userId. If userId is null, it's global? 
    // Let's query for categories where userId is the current user OR userId is NULL (if we support global defaults)
    // For now, let's strict to user's categories if we seeded them per user, or check the schema.

    // In seed.ts we saw: await db.insert(categories).values(defaultCategories.map(c => ({ ...c, userId })));
    // So categories are per-user.

    const userCategories = await db.select().from(categories).where(eq(categories.userId, user.id));
    return userCategories;
}

export async function createCategory(data: { id?: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string; color: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        await db.insert(categories).values({
            ...data,
            id: data.id, // Use provided ID if available
            userId: user.id,
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to create category:', error);
        return { error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, data: { name: string; type: 'INCOME' | 'EXPENSE'; icon: string; color: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        await db.update(categories)
            .set(data)
            .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update category:', error);
        return { error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check for existing transactions
        const linkedTransactions = await db.select().from(transactions).where(eq(transactions.categoryId, id));
        if (linkedTransactions.length > 0) {
            return { error: 'Cannot delete category with existing transactions' };
        }

        await db.delete(categories)
            .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete category:', error);
        return { error: 'Failed to delete category' };
    }
}
