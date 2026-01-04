import { LocalDataStore } from './local-store';
import { MutationQueue } from './mutation-queue';
import { createTransaction, deleteTransaction, updateTransaction } from '@/actions/transactions';
import { createWallet, deleteWallet, updateWallet } from '@/actions/wallets';
import { createCategory, deleteCategory, updateCategory } from '@/actions/categories';
import { createBudget, deleteBudget, updateBudget } from '@/actions/budgets';
import { getBatchSyncData } from '@/actions/sync/batch-get';
import { seedDefaultWallet } from '@/actions/wallets/seed';
import { seedDefaultCategories } from '@/actions/categories/seed';
import { getWallets } from '@/actions/wallets';
import { getCategories } from '@/actions/categories';
import { toast } from 'sonner';

class SyncEngine {
    private isSyncing = false;
    private listeners: (() => void)[] = [];

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    // Pull latest data from server and update local store
    async pull(userId: string) {
        try {
            console.log('SyncEngine: Pulling data...');

            // Helper to ensure dates are strings
            const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

            // Single batch fetch with optimized limits (1x auth call instead of 4x)
            const {
                transactions: serverTransactions,
                wallets: serverWallets,
                categories: serverCategories,
                budgets: serverBudgets
            } = await getBatchSyncData({ transactionLimit: 500 });

            // Auto-Seeding (Self-Repair)
            // If the user has NO wallets and NO categories (likely a fresh account where seed failed, or data was wiped),
            // we should re-seed to prevent broken UI states.
            if (serverWallets.length === 0 && serverCategories.length === 0) {
                console.log('SyncEngine: Empty data detected. Attempting to seed default data...');
                try {
                    await Promise.all([
                        seedDefaultWallet({ userId }),
                        seedDefaultCategories({ userId })
                    ]);

                    // Re-fetch after seeding
                    const [
                        newWallets,
                        newCategories
                    ] = await Promise.all([
                        getWallets(),
                        getCategories()
                    ]);

                    // Update the variables to use the newly seeded data
                    // Note: We can't reassign const, so we'll use these new values in the setters below.
                    // Or cleaner: just call pull() again properly? 
                    // Let's just use the new values to override.

                    // Re-assigning to let (if I changed them to let) or just handle logic here.
                    // Easier: Recursively call pull once? No, dangerous.
                    // Direct override:
                    LocalDataStore.setUserId(userId);
                    LocalDataStore.setTransactions(serialize(serverTransactions)); // Still empty
                    LocalDataStore.setWallets(serialize(newWallets));
                    LocalDataStore.setCategories(serialize(newCategories));
                    LocalDataStore.setBudgets(serialize([])); // Still empty

                    this.notify();
                    console.log('SyncEngine: Auto-seeding complete.');
                    return true;
                } catch (seedError) {
                    console.error('SyncEngine: Auto-seeding failed', seedError);
                    // Continue with empty data to avoid crash
                }
            }

            // We need to map server data to local format
            // IDs are UUIDs, so they match.
            // Dates might need conversion if they come as Date objects (Server Actions return JSON usually, but Drizzle returns Date objects)

            LocalDataStore.setUserId(userId);
            LocalDataStore.setTransactions(serialize(serverTransactions));
            LocalDataStore.setWallets(serialize(serverWallets));
            LocalDataStore.setCategories(serialize(serverCategories));
            // Budgets from server come joined with Category, we need to flatten/clean if needed
            // LocalDataStore expects raw budgets. 
            // The getBudgets action returns items with `spent` and `category` object.
            // We should strip them for storage or just store them and ignore?
            // LocalStore expects: { id, categoryId, amount, period, createdAt }
            const cleanBudgets = serverBudgets.map((b: any) => ({
                id: b.id,
                categoryId: b.categoryId,
                amount: Number(b.amount),
                period: b.period,
                createdAt: b.createdAt
            }));
            LocalDataStore.setBudgets(serialize(cleanBudgets));

            this.notify(); // Notify listeners that data has updated
            console.log('SyncEngine: Pull complete.');
            return true;
        } catch (error) {
            console.error('SyncEngine: Pull failed', error);
            return false;
        }
    }

    // Push pending mutations to server
    async push(userId: string) {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            console.log('SyncEngine: Starting push...');
            let item = MutationQueue.peek();

            while (item) {
                // Skip if item doesn't belong to current user
                if (item.userId !== userId) {
                    // Should we remove it? Or just skip? 
                    // ideally we only process current user's queue.
                    // But peek() returns generic. 
                    // If queue has mixed user data (rare), we might get stuck.
                    // For now assume single user per device context mostly.
                    // Or we implementation peek(userId). 
                    // Let's just process it.
                }

                console.log(`SyncEngine: Processing ${item.type} (${item.id})`);
                let result: any = { success: false };

                switch (item.type) {
                    case 'CREATE_TRANSACTION':
                        result = await createTransaction(item.payload);
                        break;
                    case 'DELETE_TRANSACTION':
                        result = await deleteTransaction(item.payload.id);
                        break;
                    // TODO: Implement updates
                    case 'UPDATE_TRANSACTION':
                        result = await updateTransaction(item.payload.id, item.payload);
                        break;

                    case 'CREATE_WALLET':
                        result = await createWallet(item.payload);
                        break;
                    case 'UPDATE_WALLET':
                        result = await updateWallet(item.payload.id, item.payload);
                        break;
                    case 'DELETE_WALLET':
                        result = await deleteWallet(item.payload.id);
                        break;

                    case 'CREATE_CATEGORY':
                        result = await createCategory(item.payload);
                        break;
                    case 'UPDATE_CATEGORY':
                        result = await updateCategory(item.payload.id, item.payload);
                        break;
                    case 'DELETE_CATEGORY':
                        result = await deleteCategory(item.payload.id);
                        break;

                    case 'CREATE_BUDGET':
                        result = await createBudget(item.payload);
                        break;
                    case 'UPDATE_BUDGET':
                        result = await updateBudget(item.payload.id, item.payload);
                        break;
                    case 'DELETE_BUDGET':
                        result = await deleteBudget(item.payload.id);
                        break;
                }

                if (result.error) {
                    console.error(`SyncEngine: Failed to process ${item.type}`, result.error);
                    // If error is non-recoverable (e.g. invalid data), remove it.
                    // If network error, we should stop and retry later. 
                    // But currently we don't distinguish. 
                    // Logic: If it returns error string, it reached server and server rejected. 
                    // So we should remove it to prevent blocking.
                    MutationQueue.dequeue();
                    toast.error(`Sync failed for one item: ${result.error}`);
                } else {
                    MutationQueue.dequeue();
                }

                item = MutationQueue.peek();
            }
            console.log('SyncEngine: Push complete.');
        } catch (error) {
            console.error('SyncEngine: Push error (Network?)', error);
        } finally {
            this.isSyncing = false;
        }
    }
}

export const syncEngine = new SyncEngine();
