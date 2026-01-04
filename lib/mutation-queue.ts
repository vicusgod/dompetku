// Mutation Queue for Offline-First Sync
// Stores server actions locally to be replayed when online

export interface MutationItem {
    id: string;
    type:
    | 'CREATE_TRANSACTION'
    | 'DELETE_TRANSACTION'
    | 'UPDATE_TRANSACTION'
    | 'CREATE_WALLET'
    | 'UPDATE_WALLET'
    | 'DELETE_WALLET'
    | 'CREATE_CATEGORY'
    | 'UPDATE_CATEGORY'
    | 'DELETE_CATEGORY'
    | 'CREATE_BUDGET'
    | 'UPDATE_BUDGET'
    | 'DELETE_BUDGET';
    payload: any;
    timestamp: number;
    retryCount: number;
    userId: string;
}

const QUEUE_KEY = 'duit_mutation_queue';

class Queue {
    private getQueue(): MutationItem[] {
        if (typeof window === 'undefined') return [];
        const item = localStorage.getItem(QUEUE_KEY);
        return item ? JSON.parse(item) : [];
    }

    private setQueue(queue: MutationItem[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }

    // Add an item to the queue
    enqueue(type: MutationItem['type'], payload: any, userId: string) {
        const queue = this.getQueue();
        const item: MutationItem = {
            id: crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
            userId
        };
        queue.push(item);
        this.setQueue(queue);
        return item;
    }

    // Get the next item to process
    peek(): MutationItem | undefined {
        const queue = this.getQueue();
        return queue[0];
    }

    // Remove the processed item
    dequeue() {
        const queue = this.getQueue();
        queue.shift();
        this.setQueue(queue);
    }

    // Update retry count (if failed but retryable)
    retry(id: string) {
        const queue = this.getQueue();
        const item = queue.find(q => q.id === id);
        if (item) {
            item.retryCount++;
            this.setQueue(queue);
        }
    }

    // Remove specific item (if fatal error)
    remove(id: string) {
        const queue = this.getQueue().filter(q => q.id !== id);
        this.setQueue(queue);
    }

    // Get all items (for debugging or UI status)
    getAll(): MutationItem[] {
        return this.getQueue();
    }

    // Clear queue (for debugging)
    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(QUEUE_KEY);
    }
}

export const MutationQueue = new Queue();
