'use client';

import { useDeleteBudget } from '@/hooks/use-data';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSettings } from '@/components/providers/settings-provider';

interface BudgetCardProps {
    budget: any;
}

export function BudgetCard({ budget }: BudgetCardProps) {
    const { mutate: deleteBudget, isPending } = useDeleteBudget();
    const [open, setOpen] = useState(false);

    const spent = budget.spent || 0;
    const percentage = Math.min((spent / parseFloat(budget.amount)) * 100, 100);
    const isOverBudget = spent > parseFloat(budget.amount);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();

        deleteBudget(budget.id, {
            onSuccess: () => {
                toast.success('Budget deleted');
                setOpen(false);
            },
            onError: (error) => {
                toast.error('Failed to delete budget');
            }
        });
    };

    const settings = useSettings();
    const { currency } = settings;

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 hover:shadow-lg transition-all group border border-white/60">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isOverBudget ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary'}`}>
                        <span className="material-symbols-outlined">
                            {budget.categoryName?.toLowerCase().includes('food') ? 'restaurant' :
                                budget.categoryName?.toLowerCase().includes('transport') ? 'directions_car' :
                                    budget.categoryName?.toLowerCase().includes('shop') ? 'shopping_bag' :
                                        'category'}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold text-lg">{budget.categoryName}</h4>
                        <p className="text-slate-500 text-xs font-medium">Monthly Limit</p>
                    </div>
                </div>

                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            disabled={isPending}
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the budget for <strong>{budget.categoryName}</strong>? This will remove the spending limit tracking, but transactions will remain.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                disabled={isPending}
                            >
                                {isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <span className="text-slate-900 font-bold text-2xl">{formatCurrency(spent, currency)}</span>
                    <span className="text-slate-400 text-sm font-medium mb-1">/ {formatCurrency(parseFloat(budget.amount), currency)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-primary'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-1">
                    <span className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-500'}`}>
                        {percentage.toFixed(0)}% Used
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        {formatCurrency(Math.max(0, parseFloat(budget.amount) - spent), currency)} left
                    </span>
                </div>
            </div>
        </div>
    );
}
