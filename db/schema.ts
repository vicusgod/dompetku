import { pgTable, uuid, text, decimal, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const walletTypeEnum = pgEnum('wallet_type', ['CASH', 'BANK', 'E_WALLET']);
export const budgetPeriodEnum = pgEnum('budget_period', ['MONTHLY']);

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: transactionTypeEnum('type').notNull(),
  userId: uuid('user_id'), // Nullable for system defaults
  icon: text('icon'), // Lucide icon name or emoji
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Wallets Table
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: walletTypeEnum('type').default('CASH').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  userId: uuid('user_id').notNull(),
  order: integer('order').default(0),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Budgets Table
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  period: budgetPeriodEnum('period').default('MONTHLY').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  walletId: uuid('wallet_id').references(() => wallets.id), // Made optional first to avoid migration issues, but we should fill it
  userId: uuid('user_id').notNull(),
  date: timestamp('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const walletsRelations = relations(wallets, ({ many }) => ({
  transactions: many(transactions),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));
