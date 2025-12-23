'use client';

import { useState, useTransition } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reorderWallets } from '@/actions/wallets';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface WalletReorderDialogProps {
    wallets: any[];
    children: React.ReactNode;
}

export function WalletReorderDialog({ wallets: initialWallets, children }: WalletReorderDialogProps) {
    const [wallets, setWallets] = useState(initialWallets);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newWallets = [...wallets];
        [newWallets[index - 1], newWallets[index]] = [newWallets[index], newWallets[index - 1]];
        setWallets(newWallets);
    };

    const moveDown = (index: number) => {
        if (index === wallets.length - 1) return;
        const newWallets = [...wallets];
        [newWallets[index + 1], newWallets[index]] = [newWallets[index], newWallets[index + 1]];
        setWallets(newWallets);
    };

    const handleSave = () => {
        startTransition(async () => {
            const updates = wallets.map((w, index) => ({
                id: w.id,
                order: index,
            }));

            const result = await reorderWallets(updates);

            if (result.success) {
                toast.success('Wallets reordered successfully');
                setIsOpen(false);
            } else {
                toast.error('Failed to reorder wallets');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) setWallets(initialWallets); // Reset on open
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reorder Wallets</DialogTitle>
                    <DialogDescription>
                        Adjust the order of your wallets. The first wallet will appear first on the dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                    {wallets.map((wallet, index) => (
                        <div
                            key={wallet.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-slate-200/50 text-slate-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        {wallet.type === 'CASH' ? 'wallet' : wallet.type === 'BANK' ? 'account_balance' : 'account_balance_wallet'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-slate-700">{wallet.name}</span>
                                    <span className="text-xs text-slate-400 capitalize">{wallet.type.toLowerCase().replace('_', ' ')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
                                </button>
                                <button
                                    onClick={() => moveDown(index)}
                                    disabled={index === wallets.length - 1}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Order'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
