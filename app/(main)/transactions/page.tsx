'use client';

import { useTransactions, useWallets } from '@/hooks/use-data';
import { useSettings } from '@/components/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

import { Suspense, useState, useEffect } from 'react';

import { ExportTransactionDialog } from '@/components/transactions/export-transaction-dialog';

function TransactionsContent() {
    const searchParams = useSearchParams();

    // Extract params
    const search = searchParams.get('search') || undefined;
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    const walletId = searchParams.get('walletId') || undefined;

    // Fetch Data
    const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions({
        search, from, to, walletId
    });

    const { data: wallets = [], isLoading: isWalletsLoading } = useWallets();

    const isLoading = isTransactionsLoading || isWalletsLoading;


    // Settings
    const settings = useSettings();
    const { currency, hideBalances } = settings;
    const balanceStyle = hideBalances ? "blur-sm select-none" : "";

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, from, to, walletId]);

    // Pagination Logic
    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8 overflow-y-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-1 md:gap-2">
                    <h2 className="text-slate-900 text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">Transactions</h2>
                </div>
            </header>

            {/* Search and Filter */}
            <TransactionFilters wallets={wallets} />

            {/* Transactions Table */}
            <section className="glass-solid rounded-2xl overflow-hidden flex flex-col min-h-[400px] shadow-sm bg-white/90 backdrop-blur-md border border-slate-200/80">
                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="w-full text-left border-collapse hidden md:table">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Wallet</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-16">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {currentTransactions.map((transaction: any) => {
                                const isIncome = transaction.type === 'INCOME';
                                return (
                                    <tr key={transaction.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                                                    <span className="material-symbols-outlined text-[20px]">{isIncome ? 'work' : 'shopping_cart'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{transaction.categoryName || 'Transaction'}</span>
                                                    <span className="text-xs text-slate-400">{transaction.note || transaction.description || 'No description'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${isIncome ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                                                }`}>
                                                {transaction.categoryName || (isIncome ? 'Income' : 'Expense')}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-primary ring-2 ring-blue-100"></div>
                                                <span className="text-sm text-slate-600 font-medium">{transaction.walletId ? wallets.find((w: any) => w.id === transaction.walletId)?.name : 'Main Wallet'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm text-slate-500 font-medium font-mono">{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className={`text-sm font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-slate-800'} ${balanceStyle}`}>
                                                {isIncome ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), currency)}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Mobile List View */}
                    <div className="flex flex-col md:hidden">
                        {currentTransactions.map((transaction: any) => {
                            const isIncome = transaction.type === 'INCOME';
                            return (
                                <div key={transaction.id} className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="size-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                                            <span className="material-symbols-outlined text-[20px]">{isIncome ? 'work' : 'shopping_cart'}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-slate-800 truncate">{transaction.categoryName || 'Transaction'}</span>
                                            <span className="text-xs text-slate-500 truncate">{transaction.note || transaction.description || 'No description'}</span>
                                            <span className="text-[10px] text-slate-400 mt-0.5">{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-sm font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-slate-800'} ${balanceStyle}`}>
                                            {isIncome ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), currency)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-1">{transaction.walletId ? wallets.find((w: any) => w.id === transaction.walletId)?.name : 'Main Wallet'}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {currentTransactions.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No transactions found.
                            </div>
                        )}
                    </div>
                </div>
                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between mt-auto bg-slate-50/50 gap-4">
                    <span className="text-xs text-slate-500 font-medium">Showing <span className="text-slate-800 font-bold">{totalItems === 0 ? 0 : startIndex + 1}-{endIndex}</span> of <span className="text-slate-800 font-bold">{totalItems}</span> transactions</span>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex gap-3">
                            <ExportTransactionDialog>
                                <Button variant="outline" className="flex items-center justify-center h-9 px-3 rounded-lg bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-primary hover:border-primary/20 transition-all shadow-sm gap-2">
                                    <span className="material-symbols-outlined text-[18px]">file_download</span>
                                    <span>Export CSV</span>
                                </Button>
                            </ExportTransactionDialog>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className="size-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-white hover:text-primary hover:border-primary/50 shadow-sm disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentPage >= totalPages}
                                className="size-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-white hover:text-primary hover:border-primary/50 shadow-sm disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        }>
            <TransactionsContent />
        </Suspense>
    );
}
