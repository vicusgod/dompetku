'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { LocalDataStore, LocalTransaction, LocalWallet, LocalCategory, LocalBudget } from '@/lib/local-store';
import { MutationQueue } from '@/lib/mutation-queue';
import { syncEngine } from '@/lib/sync-engine';
import { toast } from 'sonner';

// --- Transactions Hook ---
// --- Transactions Hook ---
export function useTransactions(filters?: { from?: string; to?: string; walletId?: string; search?: string }) {
    const { user, isGuest } = useAuth();
    // We rely on useSync to invalidate queries, so this query will re-run when LocalDataStore updates.
    return useQuery({
        queryKey: ['transactions', filters, user?.id, isGuest],
        networkMode: 'always',
        queryFn: async () => {
            let transactions = LocalDataStore.getTransactions();

            // Apply client-side filters
            if (filters?.from) {
                transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.from!));
            }
            if (filters?.to) {
                transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.to!));
            }
            if (filters?.walletId) {
                transactions = transactions.filter(t => t.walletId === filters.walletId);
            }
            if (filters?.search) {
                const searchLower = filters.search.toLowerCase();
                transactions = transactions.filter(t => t.note?.toLowerCase().includes(searchLower));
            }
            return transactions;
        },
    });
}

export function useCreateTransaction() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async (data: Omit<LocalTransaction, 'id' | 'createdAt'>) => {
            // 1. Create Locally
            const newTx = LocalDataStore.createTransaction(data);

            // 2. If Authenticated, Queue for Sync
            if (user && !isGuest) {
                MutationQueue.enqueue('CREATE_TRANSACTION', newTx, user.id);
                // Trigger background sync (fire and forget)
                syncEngine.push(user.id).catch(err => console.error('Background sync trigger failed', err));
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
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async (id: string) => {
            LocalDataStore.deleteTransaction(id);

            if (user && !isGuest) {
                MutationQueue.enqueue('DELETE_TRANSACTION', { id }, user.id);
                syncEngine.push(user.id).catch(console.error);
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
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            // 1. Update Locally
            LocalDataStore.updateTransaction(id, {
                ...data,
                date: typeof data.date === 'string' ? data.date : data.date.toISOString(),
            });

            // 2. Queue if Auth
            if (user && !isGuest) {
                // Should we pass data as is? Server expects what?
                // Server updateTransaction takes object.
                // MutationQueue payload: { id, ...data }
                MutationQueue.enqueue('UPDATE_TRANSACTION', { id, ...data }, user.id);
                syncEngine.push(user.id).catch(console.error);
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
    const { user, isGuest } = useAuth();
    return useQuery({
        queryKey: ['wallets', user?.id, isGuest],
        networkMode: 'always',
        queryFn: async () => {
            return LocalDataStore.getWallets();
        },
    });
}

export function useCreateWallet() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async (data: any) => {
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
        networkMode: 'always',
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
        networkMode: 'always',
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
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
    const { user, isGuest } = useAuth();
    return useQuery({
        queryKey: ['categories', user?.id, isGuest],
        networkMode: 'always',
        queryFn: async () => {
            return LocalDataStore.getCategories();
        },
    });
}

export function useCreateCategory() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async (data: any) => {
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
        networkMode: 'always',
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
        networkMode: 'always',
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            LocalDataStore.updateCategory(id, data);

            // TODO: Implement update category in sync engine / queue if needed
            // MutationQueue.enqueue('UPDATE_CATEGORY', { id, ...data }, user.id);
            // syncEngine.push(user.id).catch(console.error);
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
        networkMode: 'always',
        queryFn: async () => {
            return LocalDataStore.getBudgets();
        },
    });
}

export function useCreateBudget() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
        mutationFn: async (data: any) => {
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
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create budget');
        }
    });
}

export function useDeleteBudget() {
    const { user, isGuest } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: 'always',
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
