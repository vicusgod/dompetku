import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Starting database seed...');

    // Dynamic import to ensure process.env is populated
    const { db } = await import('@/db');
    const { categories, wallets } = await import('@/db/schema');

    try {
        // Seed Categories (System Defaults - userId is null)
        console.log('Seeding categories...');
        const defaultCategories = [
            { name: 'Food & Dining', type: 'EXPENSE', icon: 'restaurant' },
            { name: 'Transportation', type: 'EXPENSE', icon: 'directions_car' },
            { name: 'Shopping', type: 'EXPENSE', icon: 'shopping_bag' },
            { name: 'Housing', type: 'EXPENSE', icon: 'home' },
            { name: 'Utilities', type: 'EXPENSE', icon: 'bolt' },
            { name: 'Entertainment', type: 'EXPENSE', icon: 'movie' },
            { name: 'Salary', type: 'INCOME', icon: 'payments' },
            { name: 'Investment', type: 'INCOME', icon: 'trending_up' },
            { name: 'Gift', type: 'INCOME', icon: 'card_giftcard' },
        ];

        for (const cat of defaultCategories) {
            await db.execute(sql`
                INSERT INTO "categories" ("name", "type", "icon") 
                VALUES (${cat.name}, ${cat.type}::transaction_type, ${cat.icon})
                ON CONFLICT DO NOTHING
            `);
        }
        console.log('Categories seeded.');

        // Seed Default Wallet for Demo User
        console.log('Seeding wallet...');
        const demoUserId = '11111111-1111-1111-1111-111111111111';

        await db.execute(sql`
            INSERT INTO "wallets" ("id", "name", "type", "balance", "user_id")
            VALUES (gen_random_uuid(), 'Cash Wallet', 'CASH'::wallet_type, 0, ${demoUserId})
            ON CONFLICT DO NOTHING
        `);
        console.log('Wallet seeded.');

        console.log('Database seed completed successfully.');
    } catch (error) {
        console.error('Database seed failed:', error);
    }
    process.exit(0);
}

main();
