// Local Storage Data Store
// Supports both Guest Mode and Authenticated Offline Mode

import { Transaction, Wallet, Category, Budget } from '@/types';

export type LocalTransaction = Transaction;
export type LocalWallet = Wallet;
export type LocalCategory = Category;
export type LocalBudget = Budget;


const GUEST_PREFIX = 'guest';

// Default categories for new guests
const DEFAULT_CATEGORIES: LocalCategory[] = [
    // EXPENSE
    { id: 'cat-1', name: 'Food & Drink', type: 'EXPENSE', icon: 'restaurant', color: '#ef4444' }, // Red
    { id: 'cat-2', name: 'Transportation', type: 'EXPENSE', icon: 'directions_bus', color: '#3b82f6' }, // Blue
    { id: 'cat-3', name: 'Shopping', type: 'EXPENSE', icon: 'shopping_bag', color: '#ec4899' }, // Pink
    { id: 'cat-4', name: 'Housing', type: 'EXPENSE', icon: 'home', color: '#f97316' }, // Orange
    { id: 'cat-5', name: 'Entertainment', type: 'EXPENSE', icon: 'movie', color: '#8b5cf6' }, // Purple
    { id: 'cat-6', name: 'Health', type: 'EXPENSE', icon: 'medical_services', color: '#10b981' }, // Emerald
    { id: 'cat-7', name: 'Education', type: 'EXPENSE', icon: 'school', color: '#06b6d4' }, // Cyan
    { id: 'cat-8', name: 'Others', type: 'EXPENSE', icon: 'more_horiz', color: '#64748b' }, // Slate

    // INCOME
    { id: 'cat-inc-1', name: 'Salary', type: 'INCOME', icon: 'work', color: '#22c55e' }, // Green
    { id: 'cat-inc-2', name: 'Business', type: 'INCOME', icon: 'store', color: '#0ea5e9' }, // Sky
    { id: 'cat-inc-3', name: 'Gift', type: 'INCOME', icon: 'card_giftcard', color: '#d946ef' }, // Fuchsia
    { id: 'cat-inc-4', name: 'Investment', type: 'INCOME', icon: 'trending_up', color: '#eab308' }, // Yellow
    { id: 'cat-inc-5', name: 'Other Income', type: 'INCOME', icon: 'attach_money', color: '#84cc16' }, // Lime
];

class LocalStore {
    private currentUserId: string | null = null;
    private initialized: boolean = false;

    // --- Configuration ---

    setUserId(userId: string | null) {
        this.currentUserId = userId;
        // Re-initialize check for this user context?
        // Actually, we just change the prefix. 
        // We might want to ensure defaults exist if it's a new auth user doing offline first? 
        // For AUTH users, we usually sync from server first.
        // But if they start offline, they might have 0 data. That's fine.
    }

    private getKeys() {
        const prefix = this.currentUserId ? `duit_auth_${this.currentUserId}` : GUEST_PREFIX;
        return {
            TRANSACTIONS: `${prefix}_transactions`,
            WALLETS: `${prefix}_wallets`,
            CATEGORIES: `${prefix}_categories`,
            BUDGETS: `${prefix}_budgets`,
            INITIALIZED: `${prefix}_initialized`,
        };
    }

    // --- Core Helpers ---

    private getItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    }

    private setItem(key: string, value: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    initialize() {
        if (typeof window === 'undefined') return;

        // Only seed defaults for GUEST users. 
        // Authenticated users rely on server sync (or empty start).
        if (this.currentUserId) return;

        const keys = this.getKeys();
        const isInitialized = this.getItem(keys.INITIALIZED, false);

        if (!isInitialized) {
            // Seed default data for Guest
            const initialWallets: LocalWallet[] = [
                {
                    id: 'wallet-1',
                    name: 'Cash',
                    type: 'CASH',
                    balance: 0,
                    order: 0,
                    icon: 'wallet',
                    createdAt: new Date().toISOString(),
                }
            ];

            this.setItem(keys.WALLETS, initialWallets);
            this.setItem(keys.CATEGORIES, DEFAULT_CATEGORIES);
            this.setItem(keys.TRANSACTIONS, []);
            this.setItem(keys.BUDGETS, []);
            this.setItem(keys.INITIALIZED, true);
        }
    }

    clear() {
        if (typeof window === 'undefined') return;
        const keys = this.getKeys();
        Object.values(keys).forEach(key => localStorage.removeItem(key));
    }

    // --- Transactions ---

    getTransactions(): LocalTransaction[] {
        const keys = this.getKeys();
        return this.getItem<LocalTransaction[]>(keys.TRANSACTIONS, [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    createTransaction(transaction: Omit<LocalTransaction, 'id' | 'createdAt'>) {
        const keys = this.getKeys();
        const transactions = this.getTransactions();
        const newTransaction: LocalTransaction = {
            ...transaction,
            id: crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        transactions.unshift(newTransaction);
        this.setItem(keys.TRANSACTIONS, transactions);

        // Update Wallet Balance
        this.updateWalletBalance(transaction.walletId, transaction.amount, transaction.type);

        return newTransaction;
    }

    setTransactions(transactions: LocalTransaction[]) {
        const keys = this.getKeys();
        this.setItem(keys.TRANSACTIONS, transactions);
    }

    updateTransaction(id: string, data: Partial<Omit<LocalTransaction, 'id' | 'createdAt'>>) {
        const keys = this.getKeys();
        const transactions = this.getTransactions();
        const idx = transactions.findIndex(t => t.id === id);
        if (idx !== -1) {
            const oldTx = transactions[idx];
            const newTx = { ...oldTx, ...data };
            transactions[idx] = newTx;
            this.setItem(keys.TRANSACTIONS, transactions);

            // Update balances if amount/type/wallet changed
            // Complex case: Revert old, apply new.
            // Simplified: Revert old effect, apply new effect.
            // Only if amount, type, or wallet changed.
            if (oldTx.amount !== newTx.amount || oldTx.type !== newTx.type || oldTx.walletId !== newTx.walletId) {
                const revertType = oldTx.type === 'INCOME' ? 'EXPENSE' : 'INCOME';
                this.updateWalletBalance(oldTx.walletId, oldTx.amount, revertType);
                this.updateWalletBalance(newTx.walletId, newTx.amount, newTx.type);
            }
        }
    }

    deleteTransaction(id: string) {
        const keys = this.getKeys();
        const transactions = this.getTransactions();
        const txToDelete = transactions.find(t => t.id === id);

        if (txToDelete) {
            const updatedTransactions = transactions.filter(t => t.id !== id);
            this.setItem(keys.TRANSACTIONS, updatedTransactions);

            // Revert balance
            // Income deleted -> subtract amount (add negative)
            // Expense deleted -> add amount
            const revertType = txToDelete.type === 'INCOME' ? 'EXPENSE' : 'INCOME';
            this.updateWalletBalance(txToDelete.walletId, txToDelete.amount, revertType);
        }
    }

    // --- Wallets ---

    getWallets(): LocalWallet[] {
        const keys = this.getKeys();
        return this.getItem<LocalWallet[]>(keys.WALLETS, []).sort((a, b) => a.order - b.order);
    }

    setWallets(wallets: LocalWallet[]) {
        const keys = this.getKeys();
        this.setItem(keys.WALLETS, wallets);
    }

    createWallet(wallet: Omit<LocalWallet, 'id' | 'createdAt' | 'order'>) {
        const keys = this.getKeys();
        const wallets = this.getWallets();
        const newWallet: LocalWallet = {
            ...wallet,
            id: crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}`,
            order: wallets.length,
            createdAt: new Date().toISOString(),
        };
        wallets.push(newWallet);
        this.setItem(keys.WALLETS, wallets);
        return newWallet;
    }

    updateWallet(id: string, data: Partial<Omit<LocalWallet, 'id' | 'createdAt'>>): void {
        const keys = this.getKeys();
        const wallets = this.getWallets();
        const idx = wallets.findIndex(w => w.id === id);
        if (idx !== -1) {
            wallets[idx] = { ...wallets[idx], ...data };
            this.setItem(keys.WALLETS, wallets);
        }
    }

    updateWalletBalance(walletId: string, amount: number, type: 'INCOME' | 'EXPENSE') {
        const keys = this.getKeys();
        const wallets = this.getWallets();
        const walletIndex = wallets.findIndex(w => w.id === walletId);

        if (walletIndex >= 0) {
            const currentBalance = Number(wallets[walletIndex].balance);
            const amountNum = Number(amount);

            if (type === 'INCOME') {
                wallets[walletIndex].balance = currentBalance + amountNum;
            } else {
                wallets[walletIndex].balance = currentBalance - amountNum;
            }

            this.setItem(keys.WALLETS, wallets);
        }
    }

    deleteWallet(id: string): void {
        const keys = this.getKeys();
        const wallets = this.getWallets().filter(w => w.id !== id);
        this.setItem(keys.WALLETS, wallets);
    }

    // --- Categories ---

    getCategories(): LocalCategory[] {
        const keys = this.getKeys();
        return this.getItem<LocalCategory[]>(keys.CATEGORIES, []);
    }

    setCategories(categories: LocalCategory[]) {
        const keys = this.getKeys();
        this.setItem(keys.CATEGORIES, categories);
    }

    createCategory(category: Omit<LocalCategory, 'id'>) {
        const keys = this.getKeys();
        const categories = this.getCategories();
        const newCategory: LocalCategory = {
            ...category,
            id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
        };
        categories.push(newCategory);
        this.setItem(keys.CATEGORIES, categories);
        return newCategory;
    }

    updateCategory(id: string, data: Partial<Omit<LocalCategory, 'id'>>): void {
        const keys = this.getKeys();
        const categories = this.getCategories();
        const idx = categories.findIndex(c => c.id === id);
        if (idx !== -1) {
            categories[idx] = { ...categories[idx], ...data };
            this.setItem(keys.CATEGORIES, categories);
        }
    }

    deleteCategory(id: string): void {
        const keys = this.getKeys();
        const categories = this.getCategories().filter(c => c.id !== id);
        this.setItem(keys.CATEGORIES, categories);
    }


    // --- Budgets ---

    getBudgets(): (LocalBudget & { category?: LocalCategory; spent: number })[] {
        const keys = this.getKeys();
        const budgets = this.getItem<LocalBudget[]>(keys.BUDGETS, []);
        const categories = this.getCategories();
        const transactions = this.getTransactions();

        // Calculate spent for each budget (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        return budgets.map(b => {
            const category = categories.find(c => c.id === b.categoryId);
            const spent = transactions
                .filter(t =>
                    t.categoryId === b.categoryId &&
                    t.type === 'EXPENSE' &&
                    new Date(t.date) >= startOfMonth &&
                    new Date(t.date) <= endOfMonth
                )
                .reduce((sum, t) => sum + t.amount, 0);
            return { ...b, category, spent };
        });
    }

    setBudgets(budgets: LocalBudget[]) {
        const keys = this.getKeys();
        this.setItem(keys.BUDGETS, budgets);
    }

    createBudget(budget: Omit<LocalBudget, 'id' | 'createdAt'>) {
        const keys = this.getKeys();
        const budgets = this.getItem<LocalBudget[]>(keys.BUDGETS, []);
        const newBudget: LocalBudget = {
            ...budget,
            id: crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        budgets.push(newBudget);
        this.setItem(keys.BUDGETS, budgets);
        return newBudget;
    }

    updateBudget(id: string, data: Partial<Omit<LocalBudget, 'id' | 'createdAt'>>) {
        const keys = this.getKeys();
        const budgets = this.getItem<LocalBudget[]>(keys.BUDGETS, []);
        const idx = budgets.findIndex(b => b.id === id);
        if (idx !== -1) {
            budgets[idx] = { ...budgets[idx], ...data };
            this.setItem(keys.BUDGETS, budgets);
        }
    }

    deleteBudget(id: string) {
        const keys = this.getKeys();
        const budgets = this.getItem<LocalBudget[]>(keys.BUDGETS, []).filter(b => b.id !== id);
        this.setItem(keys.BUDGETS, budgets);
    }
}

export const LocalDataStore = new LocalStore();
