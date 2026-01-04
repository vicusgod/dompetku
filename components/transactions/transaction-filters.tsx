'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subDays, startOfDay, endOfDay } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Calendar, ListFilter, Plus } from 'lucide-react';

export function TransactionFilters({ wallets }: { wallets: any[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Get current filters
    const currentSearch = searchParams.get('search') || '';
    const currentWallet = searchParams.get('walletId') || 'all';

    // Date filters
    const currentFrom = searchParams.get('from');
    const currentTo = searchParams.get('to');

    // Local state for search input to handle debounce
    const [searchValue, setSearchValue] = useState(currentSearch);

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleWalletChange = (walletId: string) => {
        const params = new URLSearchParams(searchParams);
        if (walletId && walletId !== 'all') {
            params.set('walletId', walletId);
        } else {
            params.delete('walletId');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        const now = new Date();

        if (value === 'all_time') {
            params.delete('from');
            params.delete('to');
        } else {
            let from, to;
            switch (value) {
                case 'this_day':
                    from = startOfDay(now);
                    to = endOfDay(now);
                    break;
                case 'this_week':
                    from = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
                    to = endOfWeek(now, { weekStartsOn: 1 });
                    break;
                case 'this_month':
                    from = startOfMonth(now);
                    to = endOfMonth(now);
                    break;
                case 'last_month':
                    const lastMonth = subMonths(now, 1);
                    from = startOfMonth(lastMonth);
                    to = endOfMonth(lastMonth);
                    break;
                default:
                    break;
            }

            if (from && to) {
                params.set('from', format(from, 'yyyy-MM-dd'));
                params.set('to', format(to, 'yyyy-MM-dd'));
            }
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const getPeriodValue = () => {
        if (!currentFrom || !currentTo) return 'all_time';

        const now = new Date();
        const from = currentFrom;
        const to = currentTo;

        const isSameDay = (d1: string, d2: Date) => d1 === format(d2, 'yyyy-MM-dd');

        if (isSameDay(from, now) && isSameDay(to, now)) return 'this_day';

        const startWeek = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const endWeek = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        if (from === startWeek && to === endWeek) return 'this_week';

        const startMonth = format(startOfMonth(now), 'yyyy-MM-dd');
        const endMonth = format(endOfMonth(now), 'yyyy-MM-dd');
        if (from === startMonth && to === endMonth) return 'this_month';

        const lastMonthDate = subMonths(now, 1);
        const startLastMonth = format(startOfMonth(lastMonthDate), 'yyyy-MM-dd');
        const endLastMonth = format(endOfMonth(lastMonthDate), 'yyyy-MM-dd');
        if (from === startLastMonth && to === endLastMonth) return 'last_month';

        return 'custom';
    };

    return (
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Row 1: Search */}
            <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-5" />
                <input
                    className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                    placeholder="Search transactions..."
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchValue(value);
                        // Simple debounce timeout
                        const timeoutId = setTimeout(() => {
                            handleSearch(value);
                        }, 500);
                        return () => clearTimeout(timeoutId);
                    }}
                />
            </div>

            {/* Row 2: Filters */}
            <div className="flex gap-3 w-full">
                {/* Period Filter */}
                <div className="flex-1">
                    <Select onValueChange={handlePeriodChange} value={getPeriodValue()}>
                        <SelectTrigger className="w-full h-12 rounded-2xl bg-white border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm font-medium">
                            <div className="flex items-center gap-2 truncate">
                                <Calendar className="size-5" />
                                <SelectValue placeholder="Period" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="start">
                            <SelectItem value="this_day">Today</SelectItem>
                            <SelectItem value="this_week">This Week</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="all_time">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Wallet Filter */}
                <div className="flex-1">
                    <Select onValueChange={handleWalletChange} value={currentWallet}>
                        <SelectTrigger className="w-full h-12 rounded-2xl bg-white border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm font-medium">
                            <div className="flex items-center gap-2 truncate">
                                <ListFilter className="size-5" />
                                <SelectValue placeholder="All Wallets">
                                    {currentWallet === 'all' ? 'All Wallets' : wallets.find(w => w.id === currentWallet)?.name || 'Wallet'}
                                </SelectValue>
                            </div>
                        </SelectTrigger>
                        <SelectContent align="start">
                            <SelectItem value="all">All Wallets</SelectItem>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                    {wallet.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Row 3: Add Transaction Button */}
            <AddTransactionDialog trigger={
                <Button className="w-full h-12 bg-[#1d3cdd] hover:bg-[#152cad] text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Plus className="size-6" />
                    <span>Add Transaction</span>
                </Button>
            } />
        </section>
    );
}
