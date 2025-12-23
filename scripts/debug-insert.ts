import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Simulating insert...');

    const { db } = await import('@/db');
    const { transactions } = await import('@/db/schema');

    try {
        const result = await db.insert(transactions).values({
            amount: '10000',
            type: 'EXPENSE',
            categoryId: '4cf4d2c5-bc84-42e4-b6f3-34b7296c9cad',
            walletId: 'a9b4e564-ca35-4265-bfa7-118ebf23f93c',
            userId: '11111111-1111-1111-1111-111111111111',
            date: new Date('2025-12-19T08:11:42.516Z'),
            note: 'j'
        }).returning();

        console.log('Insert SUCCESS:', result);
    } catch (error) {
        console.error('Insert FAILED:', error);
    }
    process.exit(0);
}

main();
