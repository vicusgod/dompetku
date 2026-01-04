'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { LocalDataStore } from '@/lib/local-store';
import { Transaction, Wallet, Category, Budget } from '@/types';
import { MutationQueue } from '@/lib/mutation-queue';
import { syncEngine } from '@/lib/sync-engine';
import { toast } from 'sonner';
import { getWallets } from '@/actions/wallets';
import { getCategories } from '@/actions/categories';
import { getBudgets } from '@/actions/budgets';
import { getTransactions } from '@/actions/transactions/get-transactions';

// --- Transactions Hook ---
export function useTransactions(filters?: { from?: string; to?: string; walletId?: string; search?: string }) {
    const { isGuest } = useAuth();

    return useQuery({
        queryKey: ['transactions', filters, isGuest],
        queryFn: async () => {
            // For guests, use LocalDataStore
            if (isGuest) {
                let transactions = LocalDataStore.getTransactions();
                if (filters?.from) transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.from!));
                if (filters?.to) transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.to!));
                if (filters?.walletId) transactions = transactions.filter(t => t.walletId === filters.walletId);
                return transactions;
            }

            // For authenticated users, fetch from server
            const serverData = await getTransactions({ ...filters, limit: 500 });
            return serverData.map((t: any) => ({
                id: t.id,
                amount: Number(t.amount),
                type: t.type as 'INCOME' | 'EXPENSE',
                date: t.date,
                note: t.note,
                categoryId: '',
                categoryName: t.categoryName,
                categoryIcon: t.categoryIcon,
                walletId: t.walletId || '',
                createdAt: t.date,
            })) as unknown as Transaction[];
        },
        staleTime: 30000,
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
            // Get user directly from Supabase to avoid context issues
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            // 1. Create Locally
            const newTx = LocalDataStore.createTransaction(data);

            // 2. If Authenticated, Queue for Sync
            if (userId) {
                MutationQueue.enqueue('CREATE_TRANSACTION', newTx, userId);
                // Trigger background sync (fire and forget)
                syncEngine.push(userId).catch(err => console.error('Background sync trigger failed', err));
            }

            return newTx;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallets'] }); // Balance updates
            queryClient.invalidateQueries({ queryKey: ['budgets'] }); // Budget spent updates
            toast.success('Transaction added');
        },
        onError: (error) => {
            console.error('Create transaction failed', error);
            toast.error('Failed to create transaction');
        }
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            LocalDataStore.deleteTransaction(id);

            if (userId) {
                MutationQueue.enqueue('DELETE_TRANSACTION', { id }, userId);
                syncEngine.push(userId).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Transaction deleted');
        },
        onError: () => toast.error('Failed to delete transaction')
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Transaction, 'id' | 'createdAt'>> }) => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            const updateData: Partial<Transaction> = { ...data };
            if (data.date) {
                updateData.date = typeof data.date === 'string' ? data.date : (data.date as unknown as Date).toISOString();
            }
            LocalDataStore.updateTransaction(id, updateData);

            if (userId) {
                MutationQueue.enqueue('UPDATE_TRANSACTION', { id, ...data }, userId);
                syncEngine.push(userId).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Transaction updated');
        },
        onError: () => toast.error('Failed to update transaction')
    });
}

// --- Wallets Hook ---
export function useWallets() {
    const { isGuest } = useAuth();

    return useQuery({
        queryKey: ['wallets', isGuest],
        queryFn: async () => {
            // For guests, use LocalDataStore
            if (isGuest) {
                return LocalDataStore.getWallets();
            }

            // For authenticated users, fetch from server
            const serverData = await getWallets();
            return serverData.map((w: any) => ({
                ...w,
                balance: Number(w.balance),
                order: w.order ?? 0,
            })) as Wallet[];
        },
        staleTime: 30000,
    });
}

export function useCreateWallet() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Wallet, 'id' | 'createdAt' | 'order'>) => {
            const newWallet = LocalDataStore.createWallet(data);

            if (user && !isGuest) {
                MutationQueue.enqueue('CREATE_WALLET', newWallet, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
            return newWallet;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            toast.success('Wallet created');
        },
    });
}

export function useDeleteWallet() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            LocalDataStore.deleteWallet(id);
            if (user && !isGuest) {
                MutationQueue.enqueue('DELETE_WALLET', { id }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            toast.success('Wallet deleted');
        }
    });
}

export function useUpdateWallet() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Wallet, 'id' | 'createdAt'>> }) => {
            LocalDataStore.updateWallet(id, data);

            if (user && !isGuest) {
                MutationQueue.enqueue('UPDATE_WALLET', { id, ...data }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            toast.success('Wallet updated');
        }
    });
}


// --- Categories Hook ---
export function useCategories() {
    const { isGuest } = useAuth();

    return useQuery({
        queryKey: ['categories', isGuest],
        queryFn: async () => {
            // For guests, use LocalDataStore
            if (isGuest) {
                return LocalDataStore.getCategories();
            }

            // For authenticated users, fetch from server
            const serverData = await getCategories();
            return serverData as Category[];
        },
        staleTime: 30000,
    });
}

export function useCreateCategory() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Category, 'id'>) => {
            const newCategory = LocalDataStore.createCategory(data);
            if (user && !isGuest) {
                MutationQueue.enqueue('CREATE_CATEGORY', newCategory, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
            return newCategory;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created');
        },
    });
}

export function useDeleteCategory() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            LocalDataStore.deleteCategory(id);
            if (user && !isGuest) {
                MutationQueue.enqueue('DELETE_CATEGORY', { id }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted');
        }
    });
}

export function useUpdateCategory() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Category, 'id'>> }) => {
            LocalDataStore.updateCategory(id, data);

            if (user && !isGuest) {
                MutationQueue.enqueue('UPDATE_CATEGORY', { id, ...data }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category updated');
        }
    });
}

// --- Budgets Hook ---
export function useBudgets() {
    const { user, isGuest } = useAuth();
    return useQuery({
        queryKey: ['budgets', user?.id, isGuest],
        queryFn: async () => {
            return LocalDataStore.getBudgets();
        },
    });
}

export function useCreateBudget() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Budget, 'id' | 'createdAt'>) => {
            // Check for existing budget for this category locally
            const existing = LocalDataStore.getBudgets().find(b => b.categoryId === data.categoryId);
            if (existing) {
                throw new Error("Budget for this category already exists");
            }

            const newBudget = LocalDataStore.createBudget(data);

            if (user && !isGuest) {
                MutationQueue.enqueue('CREATE_BUDGET', newBudget, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
            return newBudget;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Budget created');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create budget');
        }
    });
}

export function useUpdateBudget() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Budget, 'id' | 'createdAt'>> }) => {
            LocalDataStore.updateBudget(id, data);

            if (user && !isGuest) {
                MutationQueue.enqueue('UPDATE_BUDGET', { id, ...data }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Budget updated');
        },
        onError: () => toast.error('Failed to update budget')
    });
}

export function useDeleteBudget() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            LocalDataStore.deleteBudget(id);
            if (user && !isGuest) {
                MutationQueue.enqueue('DELETE_BUDGET', { id }, user.id);
                syncEngine.push(user.id).catch(console.error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Budget deleted');
        }
    });
}
