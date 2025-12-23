'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn, getCurrencySymbol } from '@/lib/utils';
import { useWallets, useCategories, useCreateTransaction } from '@/hooks/use-data';
import { useSettings } from '@/components/providers/settings-provider';

export function QuickTransaction() {
    const router = useRouter();
    const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [walletId, setWalletId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [note, setNote] = useState('');

    const settings = useSettings();

    // Use unified hooks for data
    const { data: wallets = [] } = useWallets();
    const { data: allCategories = [] } = useCategories();
    const createTransactionMutation = useCreateTransaction();

    // Auto-select wallet if only one exists
    useEffect(() => {
        if (wallets.length === 1 && !walletId) {
            setWalletId(wallets[0].id);
        }
    }, [wallets, walletId]);

    // Filter categories based on selected type
    const categories = allCategories.filter((c: any) => c.type === type);

    const handleWalletChange = (value: string) => {
        if (value === '__add_wallet__') {
            router.push('/wallets');
        } else {
            setWalletId(value);
        }
    };

    const handleSubmit = async () => {
        if (!amount || !walletId || !categoryId) {
            toast.error('Please fill in all fields');
            return;
        }

        const data = {
            amount: parseFloat(amount),
            type,
            walletId,
            categoryId,
            note,
            date: new Date(),
        };

        try {
            await createTransactionMutation.mutateAsync({
                ...data,
                date: data.date.toISOString(),
            });
            toast.success('Transaction added');
            setAmount('');
            setNote('');
            // Keep wallet/category selected for convenience
        } catch (error: any) {
            toast.error(error?.message || 'Failed to add transaction');
        }
    };

    const handleReset = () => {
        setType('EXPENSE');
        setAmount('');
        setWalletId(''); // useEffect will re-select if only 1 wallet exists
        setCategoryId('');
        setNote('');
        toast.info('Form reset');
    };

    const isPending = createTransactionMutation.isPending;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6 h-fit">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Quick Transaction</h3>
                <button
                    onClick={handleReset}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    title="Reset form"
                >
                    <span className="material-symbols-outlined">restart_alt</span>
                </button>
            </div>

            {/* Type Toggle */}
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                <button
                    onClick={() => setType('EXPENSE')}
                    className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                        type === 'EXPENSE' ? "bg-white text-rose-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <span className="material-symbols-outlined text-[18px]">south</span>
                    Expense
                </button>
                <button
                    onClick={() => setType('INCOME')}
                    className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                        type === 'INCOME' ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <span className="material-symbols-outlined text-[18px]">north</span>
                    Income
                </button>
            </div>

            {/* Amount Input */}
            <div className="">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount</label>
                <div className="group relative">
                    <div className="flex items-center h-14 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 transition-all focus-within:bg-white focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                        <span className="mr-2 text-xl font-bold text-primary transition-colors group-focus-within:text-blue-600 shrink-0">
                            {getCurrencySymbol(settings.currency)}
                        </span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="h-full w-full bg-transparent text-2xl font-bold outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-2 min-w-0">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Wallet</label>
                    <Select value={walletId} onValueChange={handleWalletChange}>
                        <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {wallets.length === 0 ? (
                                <SelectItem value="__add_wallet__" className="text-primary font-semibold">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Wallet
                                    </span>
                                </SelectItem>
                            ) : (
                                wallets.map((w: any) => (
                                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Note */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Note</label>
                <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl"
                />
            </div>

            {/* Submit */}
            <Button
                onClick={handleSubmit}
                disabled={isPending || wallets.length === 0}
                className={cn(
                    "h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20",
                    isPending ? "opacity-50" : "hover:translate-y-[-2px] transition-transform"
                )}
            >
                {isPending ? 'Adding...' : 'Add Transaction'}
            </Button>
        </div>
    );
}
