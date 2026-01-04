
export type TransactionType = 'INCOME' | 'EXPENSE';
export type WalletType = 'CASH' | 'BANK' | 'E_WALLET' | 'CREDIT_CARD';
export type BudgetPeriod = 'MONTHLY' | 'WEEKLY' | 'YEARLY';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    walletId: string;
    date: string; // ISO string
    note?: string;
    description?: string; // Alias for note/description in some contexts
    categoryName?: string; // Hydrated field
    walletName?: string;   // Hydrated field
    createdAt: string;
}

export interface Wallet {
    id: string;
    name: string;
    type: WalletType;
    balance: number;
    order: number;
    icon?: string;
    userId?: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    icon: string;
    color?: string;
    userId?: string;
}

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    createdAt: string;
    // Hydrated fields
    category?: Category;
    spent?: number;
}

export interface UserProfile {
    displayName: string;
    email: string;
    photoUrl?: string;
}

export interface AppSettings {
    currency: string;
    language: string;
    hideBalances: boolean;
}
