'use client';

import { useWallets, useTransactions } from '@/hooks/use-data';
import { useSettings } from '@/components/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { AddWalletDialog } from '@/components/wallets/add-wallet-dialog';
import { formatCurrency } from '@/lib/utils';
import { WalletCard } from '@/components/wallets/wallet-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletsPage() {
    const { data: wallets = [], isLoading: isLoadingWallets } = useWallets();

    // Get current month date range for filtering transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions({
        from: startOfMonth,
        to: endOfMonth,
    });

    // Settings from hook
    const settings = useSettings();
    const { currency, hideBalances } = settings;
    const balanceStyle = hideBalances ? "blur-md select-none" : "";

    const totalBalance = wallets.reduce((acc: number, w: any) => acc + parseFloat(w.balance), 0);

    // Calculate monthly spending (sum of all EXPENSE transactions this month)
    const monthlySpending = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);

    // Calculate monthly income (sum of all INCOME transactions this month)
    const monthlyIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);

    // Total Savings = Net savings this month (income - expenses)
    const totalSavings = monthlyIncome - monthlySpending;

    const isLoading = isLoadingWallets || isLoadingTransactions;

    if (isLoading) {
        return (
            <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 pb-24 md:pb-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-64 w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 pb-24 md:pb-8 overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1A1A2E] mb-2">My Wallets</h1>
                    <p className="text-[#6E6E85] text-sm md:text-base font-medium max-w-lg">Manage your internal funds. Organize your money into separate jars for smarter spending.</p>
                </div>
                <div className="flex items-center gap-3">
                </div>
            </div>

            {/* Wallets Grid */}
            <div className="flex flex-col gap-5 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((wallet: any, index: number) => (
                        <WalletCard
                            key={wallet.id}
                            wallet={wallet}
                            index={index}
                            settings={{ currency, hideBalances }}
                        />
                    ))}

                    <div className="rounded-3xl p-6 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 group min-h-[250px] cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm group-hover:shadow-md group-hover:scale-110 flex items-center justify-center text-[#6E6E85] group-hover:text-primary transition-all duration-300">
                            <AddWalletDialog trigger={
                                <span className="material-symbols-outlined text-2xl">add</span>
                            } />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-[#1A1A2E] group-hover:text-primary transition-colors">Create New Wallet</p>
                            <p className="text-xs text-[#6E6E85] mt-1">Separate for bills, gifts, or goals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-2 text-[#6E6E85]">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[11px] opacity-70">Total Balance</p>
                        </div>
                        <div>
                            <h3 className={`text-3xl font-extrabold text-[#1A1A2E] tracking-tight mb-1 transition-all duration-300 ${balanceStyle}`}>{formatCurrency(totalBalance, currency)}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                                <span className="text-xs font-bold text-emerald-600">+12% vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Savings */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-2 text-[#6E6E85]">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <span className="material-symbols-outlined text-amber-500 text-xl">savings</span>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[11px] opacity-70">Total Savings</p>
                        </div>
                        <div>
                            <h3 className={`text-3xl font-extrabold text-[#1A1A2E] tracking-tight mb-1 transition-all duration-300 ${balanceStyle}`}>{formatCurrency(totalSavings, currency)}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                <span className="text-xs font-bold text-emerald-600">On track for goals</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Spending */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-2 text-[#6E6E85]">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <span className="material-symbols-outlined text-purple-500 text-xl">credit_card</span>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[11px] opacity-70">Monthly Spending</p>
                        </div>
                        <div>
                            <h3 className={`text-3xl font-extrabold text-[#1A1A2E] tracking-tight mb-1 transition-all duration-300 ${balanceStyle}`}>{formatCurrency(monthlySpending, currency)}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#6E6E85] text-sm">info</span>
                                <span className="text-xs font-bold text-[#6E6E85]">Based on all wallets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
