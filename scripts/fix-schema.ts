import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Fixing database schema...');

    const { db } = await import('@/db');

    try {
        await db.execute(sql`
            ALTER TABLE "transactions" 
            ADD COLUMN IF NOT EXISTS "wallet_id" uuid REFERENCES "wallets"("id");
        `);
        console.log('Added wallet_id column to transactions.');

        // Also ensure wallet_id is nullable or handled if there are existing rows?
        // For now, new column is nullable by default which matches the definition (technically optional in code, but UI forces it).

    } catch (error) {
        console.error('Schema fix failed:', error);
    }
    process.exit(0);
}

main();
