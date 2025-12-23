import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Checking database state...');

    // Dynamic import
    const { db } = await import('@/db');
    const { categories, wallets } = await import('@/db/schema');

    try {
        const allCategories = await db.select().from(categories);
        console.log(`Found ${allCategories.length} categories.`);

        const allWallets = await db.select().from(wallets);
        console.log(`Found ${allWallets.length} wallets.`);

        const targetCategoryId = '4cf4d2c5-bc84-42e4-b6f3-34b7296c9cad';
        const targetWalletId = 'a9b4e564-ca35-4265-bfa7-118ebf23f93c';

        const catExists = allCategories.find(c => c.id === targetCategoryId);
        const walletExists = allWallets.find(w => w.id === targetWalletId);

        console.log(`Target Category ${targetCategoryId} exists? ${!!catExists}`);
        if (catExists) console.log('Category:', catExists);

        console.log(`Target Wallet ${targetWalletId} exists? ${!!walletExists}`);
        if (walletExists) console.log('Wallet:', walletExists);

    } catch (error) {
        console.error('Check failed:', error);
    }
    process.exit(0);
}

main();
