'use client';

import { useBudgets } from '@/hooks/use-data';
import { AddBudgetDialog } from '@/components/budgets/add-budget-dialog';
import { BudgetCard } from '@/components/budgets/budget-card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function BudgetPage() {
    const { data: budgets = [], isLoading } = useBudgets();

    const totalAllocated = budgets.reduce((acc: number, b: any) => acc + parseFloat(b.amount), 0);
    const totalSpent = budgets.reduce((acc: number, b: any) => acc + (b.spent || 0), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const progressPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    if (isLoading) {
        return (
            <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto overflow-y-auto pb-32">
                <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto overflow-y-auto pb-32">
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1A1A2E] mb-2">Budgeting</h1>
                        <p className="text-[#6E6E85] text-sm md:text-base font-medium max-w-lg">Manage your monthly spending limits by category.</p>
                    </div>

                    {budgets.length > 0 && (
                        <AddBudgetDialog trigger={
                            <Button className="w-full md:w-auto h-12 bg-[#1d3cdd] hover:bg-[#152cad] text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <Plus className="size-6" />
                                <span>Create Budget</span>
                            </Button>
                        } />
                    )}
                </div>

                {/* Budgets Grid */}
                {budgets.length > 0 ? (
                    <>
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {budgets.map((budget: any) => (
                                <BudgetCard key={budget.id} budget={budget} />
                            ))}
                        </section>


                    </>
                ) : (
                    <AddBudgetDialog trigger={
                        <button className="w-full rounded-[32px] p-8 border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 group min-h-[300px] cursor-pointer">
                            <div className="size-16 rounded-full bg-white shadow-sm group-hover:shadow-md group-hover:scale-110 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all duration-300">
                                <Plus className="size-8" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg">Create New Budget</h3>
                                <p className="text-sm text-slate-500">Set monthly limits to track your spending</p>
                            </div>
                        </button>
                    } />
                )}
            </div>
        </div>
    );
}
