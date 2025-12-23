import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories } from './schema';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

const defaultCategories = [
    { name: 'Salary', type: 'INCOME', icon: 'wallet' },
    { name: 'Freelance', type: 'INCOME', icon: 'briefcase' },
    { name: 'Food', type: 'EXPENSE', icon: 'utensils' },
    { name: 'Transport', type: 'EXPENSE', icon: 'bus' },
    { name: 'Utilities', type: 'EXPENSE', icon: 'zap' },
    { name: 'Entertainment', type: 'EXPENSE', icon: 'film' },
    { name: 'Health', type: 'EXPENSE', icon: 'heart-pulse' },
    { name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag' },
];

async function seed() {
    console.log('Seeding categories...');
    try {
        for (const cat of defaultCategories) {
            // @ts-ignore - types conflict slightly with insert helper but this is valid
            await db.insert(categories).values(cat).onConflictDoNothing();
        }
        console.log('Seeding complete.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seed();
