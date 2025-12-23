import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Starting manual database setup...');

    // Dynamic import to ensure process.env is populated
    const { db } = await import('@/db');

    try {
        // Create Enums
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "transaction_type" AS ENUM ('INCOME', 'EXPENSE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "wallet_type" AS ENUM ('CASH', 'BANK', 'E_WALLET');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "budget_period" AS ENUM ('MONTHLY');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('Enums created or existing.');

        // Create Categories Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" text NOT NULL,
                "type" "transaction_type" NOT NULL,
                "user_id" uuid,
                "icon" text,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('Categories table checked.');

        // Create Wallets Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "wallets" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" text NOT NULL,
                "type" "wallet_type" DEFAULT 'CASH' NOT NULL,
                "balance" numeric(12, 2) DEFAULT '0' NOT NULL,
                "user_id" uuid NOT NULL,
                "icon" text,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('Wallets table checked.');

        // Create Budgets Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "budgets" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "category_id" uuid NOT NULL REFERENCES "categories"("id"),
                "amount" numeric(12, 2) NOT NULL,
                "period" "budget_period" DEFAULT 'MONTHLY' NOT NULL,
                "user_id" uuid NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('Budgets table checked.');

        // Create Transactions Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "transactions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "amount" numeric(12, 2) NOT NULL,
                "type" "transaction_type" NOT NULL,
                "category_id" uuid REFERENCES "categories"("id"),
                "wallet_id" uuid REFERENCES "wallets"("id"),
                "user_id" uuid NOT NULL,
                "date" timestamp NOT NULL,
                "note" text,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('Transactions table checked.');

        console.log('Database setup completed successfully.');
    } catch (error) {
        console.error('Database setup failed:', error);
    }
    process.exit(0);
}

main();
