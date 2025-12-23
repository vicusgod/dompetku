'use server';

import { db } from '@/db';
import { categories } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';

const DEFAULT_CATEGORIES = [
    // EXPENSE
    { name: 'Food & Drink', type: 'EXPENSE', icon: 'restaurant' },
    { name: 'Transportation', type: 'EXPENSE', icon: 'directions_bus' },
    { name: 'Shopping', type: 'EXPENSE', icon: 'shopping_bag' },
    { name: 'Housing', type: 'EXPENSE', icon: 'home' },
    { name: 'Entertainment', type: 'EXPENSE', icon: 'movie' },
    { name: 'Health', type: 'EXPENSE', icon: 'medical_services' },
    { name: 'Education', type: 'EXPENSE', icon: 'school' },
    { name: 'Others', type: 'EXPENSE', icon: 'more_horiz' },

    // INCOME
    { name: 'Salary', type: 'INCOME', icon: 'work' },
    { name: 'Business', type: 'INCOME', icon: 'store' },
    { name: 'Gift', type: 'INCOME', icon: 'card_giftcard' },
    { name: 'Investment', type: 'INCOME', icon: 'trending_up' },
    { name: 'Other Income', type: 'INCOME', icon: 'attach_money' },
] as const;

export async function seedDefaultCategories(props?: { userId?: string }) {
    let userId = props?.userId;

    if (!userId) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
    }

    if (!userId) {
        return { success: false, error: 'User not authenticated' };
    }

    // Check if user already has categories
    const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .limit(1);

    if (existing.length > 0) {
        return { success: true, message: 'Categories already exist' };
    }

    const values = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        userId: userId!,
    }));

    await db.insert(categories).values(values);

    return { success: true, message: 'Default categories seeded' };
}
