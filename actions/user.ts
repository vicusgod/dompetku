'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { transactions, budgets, wallets, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const userId = user.id;

    try {
        // Delete all data associated with the user
        // Order matters due to foreign key constraints (even if not strictly enforced by Drizzle app-side, DB might)

        // 1. Transactions (references wallets and categories)
        await db.delete(transactions).where(eq(transactions.userId, userId));

        // 2. Budgets (references categories)
        await db.delete(budgets).where(eq(budgets.userId, userId));

        // 3. Wallets
        await db.delete(wallets).where(eq(wallets.userId, userId));

        // 4. Categories
        await db.delete(categories).where(eq(categories.userId, userId));

        // 5. Delete user from Supabase Auth (Sign out first?)
        // Note: Client can't delete themselves from Auth easily without Service Role.
        // However, we can just sign them out and maybe rely on Supabase Admin API if available?
        // OR: Since we don't have Supabase Admin setup here (usually), we will just clear data.
        // Users often think "Delete Account" means "Wipe my data". 
        // If we want to actually delete the auth user, we need service_role key or an RPC.
        // For this task, wiping DB data is the critical part.

        // Let's try to delete the user using supabase-js if allowed or just sign out.
        // Actually, without admin key, we can't delete the user from 'auth.users'.
        // BUT, we can mark them for deletion or just leave the auth record (it's just an email login).
        // Let's focus on wiping data.

        // 5. Delete user from Supabase Auth
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (serviceRoleKey) {
            const { createClient: createAdminClient } = await import('@supabase/supabase-js');
            const adminAuthClient = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceRoleKey,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const { error: deleteError } = await adminAuthClient.auth.admin.deleteUser(userId);
            if (deleteError) {
                console.error('Error deleting auth user:', deleteError);
            }
        } else {
            console.warn('SUPABASE_SERVICE_ROLE_KEY not set. User will remain in Auth.');
        }

        await supabase.auth.signOut();

    } catch (error) {
        console.error('Error deleting account:', error);
        return { success: false, error: 'Failed to delete data' };
    }

    redirect('/');
}
