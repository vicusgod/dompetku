'use client';

import { QuickTransaction } from '@/components/dashboard/quick-transaction';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { WalletCarousel } from '@/components/dashboard/wallet-carousel';
import { useWallets, useTransactions, useCategories } from '@/hooks/use-data';
import { useSettings } from '@/components/providers/settings-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    const { data: wallets = [], isLoading: isLoadingWallets } = useWallets();
    const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions();
    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

    const isLoading = isLoadingWallets || isLoadingTransactions || isLoadingCategories;

    // Calculate stats from fetched data
    const stats = useMemo(() => {
        const balance = wallets.reduce((acc: number, w: any) => acc + parseFloat(w.balance || 0), 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthTransactions = transactions.filter((t: any) => new Date(t.date) >= startOfMonth);

        const income = thisMonthTransactions
            .filter((t: any) => t.type === 'INCOME')
            .reduce((acc: number, t: any) => acc + parseFloat(t.amount || 0), 0);

        const expense = thisMonthTransactions
            .filter((t: any) => t.type === 'EXPENSE')
            .reduce((acc: number, t: any) => acc + parseFloat(t.amount || 0), 0);

        const recentTransactions = transactions.slice(0, 5);

        // Chart data: group expenses by category
        const expensesByCategory: Record<string, number> = {};
        thisMonthTransactions
            .filter((t: any) => t.type === 'EXPENSE')
            .forEach((t: any) => {
                const cat = categories.find((c: any) => c.id === t.categoryId);
                const catName = cat?.name || 'Other';
                expensesByCategory[catName] = (expensesByCategory[catName] || 0) + parseFloat(t.amount || 0);
            });
        const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

        return { balance, income, expense, recentTransactions, chartData };
    }, [wallets, transactions, categories]);

    // Settings from hook
    const settings = useSettings();
    const { currency, hideBalances } = settings;
    const balanceStyle = hideBalances ? "blur-md select-none" : "";

    if (isLoading) {
        return (
            <>
                <header className="h-20 grid grid-cols-3 items-center px-8 py-4 border-b border-gray-200/50 bg-white/40 backdrop-blur-md z-10 sticky top-0">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-full max-w-[320px] mx-auto" />
                    <Skeleton className="h-10 w-20 ml-auto" />
                </header>
                <div className="flex-1 p-4 md:p-8">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="h-20 border-b border-gray-200/50 bg-white/40 backdrop-blur-md z-10 sticky top-0 flex justify-center px-4 md:px-8">
                <div className="w-full max-w-[1200px] grid grid-cols-3 items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-slate-800 text-xl font-bold leading-tight md:hidden">dompetku</h2>
                    </div>

                    <div className="flex justify-center">
                        <label className="hidden md:flex flex-col w-full max-w-[320px]">
                            <div className="flex w-full items-center rounded-xl h-10 bg-white border border-gray-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
                                <input className="w-full bg-transparent border-none text-slate-700 text-sm placeholder:text-slate-400 focus:ring-0 px-4 h-full outline-none text-center" placeholder="Search transactions..." />
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <Link href="/settings" className="size-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                    {/* Main Content Area */}
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

                        {/* 1. My Wallets (Mobile: Order 1, Desktop: Row 2 Left) */}
                        {wallets && wallets.length > 0 && (
                            <WalletCarousel wallets={wallets} currency={currency} hideBalances={hideBalances} />
                        )}

                        {/* 2. Quick Transaction (Mobile: Order 2, Desktop: Row 2 Right) */}
                        <div className="order-2 lg:order-none lg:col-span-1">
                            <QuickTransaction />
                        </div>

                        {/* 3. Recent Transactions (Mobile: Order 3, Desktop: Row 3 Left) */}
                        <div className="order-3 lg:order-none glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col bg-white/60">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-slate-800 text-lg font-bold">Recent Transactions</h2>
                                <Link href="/transactions" className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors flex items-center gap-1">
                                    View All
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                {stats.recentTransactions && stats.recentTransactions.length > 0 ? stats.recentTransactions.map((t: any) => {
                                    const isIncome = t.type === 'INCOME';
                                    const category = categories.find((c: any) => c.id === t.categoryId);
                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 border border-transparent hover:border-white/50 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:${isIncome ? 'bg-green-600' : 'bg-primary'} group-hover:text-white transition-colors shadow-sm`}>
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {isIncome ? 'work' : 'shopping_cart'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 text-sm font-bold">{category?.name || t.categoryName || 'Uncategorized'}</span>
                                                    <span className="text-slate-500 text-xs">{new Date(t.date).toLocaleDateString()} • {t.type}</span>
                                                </div>
                                            </div>
                                            <span className={`${isIncome ? 'text-green-600' : 'text-slate-800'} font-medium text-sm transition-all duration-300 ${balanceStyle}`}>
                                                {isIncome ? '+' : '-'}{formatCurrency(parseFloat(t.amount), currency)}
                                            </span>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-slate-500 text-center py-8">No recent transactions</p>
                                )}
                            </div>
                        </div>

                        {/* 4. Spending Summary (Mobile: Order 4, Desktop: Row 3 Right) */}
                        <div className="order-4 lg:order-none glass-panel rounded-2xl p-6 lg:col-span-1 flex flex-col bg-white/60">
                            <h2 className="text-slate-800 text-lg font-bold mb-6">Spending Summary</h2>
                            <SpendingChart chartData={stats.chartData} expense={stats.expense} currency={currency} />
                        </div>

                        {/* 5, 6, 7. Stats Section (Mobile: Order 5/6, Desktop: Row 1 Top) */}
                        {/* We group stats in a wrapper to place them together on desktop, but split on mobile */}
                        <section className="contents lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:mb-8">
                            {/* Total Balance (Mobile: Order 5) */}
                            <div className="order-5 lg:order-none glass-panel p-6 rounded-2xl relative overflow-hidden group bg-white/60">
                                <div className="absolute right-[-20px] top-[-20px] bg-primary/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                                <div className="relative z-10 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined text-[20px]">account_balance</span>
                                        <p className="text-slate-500 text-sm font-medium">Total Balance</p>
                                    </div>
                                    <p className={`text-slate-800 text-3xl font-bold tracking-tight transition-all duration-300 ${balanceStyle}`}>{formatCurrency(stats.balance, currency)}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">+5.2%</span>
                                        <p className="text-slate-400 text-xs">from last month</p>
                                    </div>
                                </div>
                            </div>

                            {/* Income (Mobile: Order 6) */}
                            <div className="order-6 lg:order-none glass-panel p-6 rounded-2xl flex flex-col gap-1 bg-white/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="p-2 bg-green-500/10 rounded-lg text-green-600 material-symbols-outlined text-[20px]">trending_up</span>
                                    <p className="text-slate-500 text-sm font-medium">Income (Month)</p>
                                </div>
                                <p className={`text-slate-800 text-2xl font-bold tracking-tight transition-all duration-300 ${balanceStyle}`}>{formatCurrency(stats.income, currency)}</p>
                                <p className="text-green-600 text-sm mt-1 font-medium">+12% vs last month</p>
                            </div>

                            {/* Expense (Mobile: Order 7) */}
                            <div className="order-7 lg:order-none glass-panel p-6 rounded-2xl flex flex-col gap-1 bg-white/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="p-2 bg-red-500/10 rounded-lg text-red-500 material-symbols-outlined text-[20px]">trending_down</span>
                                    <p className="text-slate-500 text-sm font-medium">Expense (Month)</p>
                                </div>
                                <p className={`text-slate-800 text-2xl font-bold tracking-tight transition-all duration-300 ${balanceStyle}`}>{formatCurrency(stats.expense, currency)}</p>
                                <p className="text-red-500 text-sm mt-1 font-medium">+2% vs last month</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
