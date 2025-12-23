'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { WalletReorderDialog } from '@/components/dashboard/wallet-reorder-dialog';
import { WalletActionsMenu } from '@/components/dashboard/wallet-actions-menu';
import { useWallets } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useSyncState } from '@/components/providers/sync-provider';
import { Plus, Wallet, Landmark, CreditCard } from 'lucide-react';

interface WalletCarouselProps {
    currency: string;
    hideBalances: boolean;
}

export function WalletCarousel({ currency, hideBalances }: WalletCarouselProps) {
    const { data: wallets = [], isLoading } = useWallets();
    const { isSyncing, hasCompletedInitialSync } = useSyncState();
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const balanceStyle = hideBalances ? "blur-md select-none" : "";

    const handleScroll = () => {
        if (containerRef.current) {
            const container = containerRef.current;
            const scrollLeft = container.scrollLeft;
            const width = container.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    // Show skeleton if:
    // - Query is loading, OR
    // - Initial sync hasn't completed yet AND no local data exists
    const showSkeleton = isLoading || (!hasCompletedInitialSync && wallets.length === 0);

    if (showSkeleton) {
        return (
            <section className="order-1 lg:order-none lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>
                {/* Skeleton Grid matched to real grid logic */}
                <div className="flex overflow-x-auto pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-4 sm:grid sm:grid-cols-2 scrollbar-none">
                    {[1, 2].map((i) => (
                        <div key={i} className="min-w-full sm:min-w-0 p-5 rounded-2xl border border-white/60 bg-white/40 h-[180px] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <div>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-28" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="order-1 lg:order-none lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-slate-800 text-lg font-bold">My Wallets</h2>
                {wallets.length > 1 ? (
                    <WalletReorderDialog wallets={wallets}>
                        <button className="text-primary text-sm font-semibold hover:text-blue-700 transition-colors">
                            Edit
                        </button>
                    </WalletReorderDialog>
                ) : (
                    <Link href="/wallets" className="text-primary text-sm font-semibold hover:text-blue-700 transition-colors">
                        View All
                    </Link>
                )}
            </div>

            <div className="relative">
                {/* Mobile: Horizontal Scroll, Desktop: Grid */}
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className={cn(
                        "flex overflow-x-auto pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-4 sm:grid scrollbar-none snap-x snap-mandatory",
                        wallets.length <= 1 ? "sm:grid-cols-1" : "sm:grid-cols-2" // Changed logic slightly to accommodate 0 or 1
                    )}
                >
                    {wallets.length === 0 ? (
                        <Link href="/wallets" className="min-w-full sm:min-w-0 snap-center glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all group bg-white/40 hover:bg-white/60 h-[180px] cursor-pointer">
                            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Plus size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-800 font-bold">Create Wallet</p>
                                <p className="text-slate-500 text-sm">Start tracking your money</p>
                            </div>
                        </Link>
                    ) : (
                        wallets.slice(0, 4).map((wallet: any, index: number) => {
                            const colors = [
                                { bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-600', border: 'hover:border-blue-500/50' },
                                { bg: 'bg-purple-500', light: 'bg-purple-500/10', text: 'text-purple-600', border: 'hover:border-purple-500/50' },
                                { bg: 'bg-pink-500', light: 'bg-pink-500/10', text: 'text-pink-600', border: 'hover:border-pink-500/50' },
                                { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'hover:border-emerald-500/50' },
                                { bg: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-600', border: 'hover:border-amber-500/50' },
                                { bg: 'bg-cyan-500', light: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'hover:border-cyan-500/50' },
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div key={wallet.id} className={`min-w-full sm:min-w-0 snap-center glass-panel p-5 rounded-2xl border border-white/60 ${color.border} transition-all cursor-pointer group bg-white/40 hover:bg-white/60`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-full ${color.light} ${color.text} group-hover:${color.bg} group-hover:text-white transition-colors shadow-sm`}>
                                            {wallet.type === 'CASH' ? <Wallet size={24} /> : wallet.type === 'BANK' ? <Landmark size={24} /> : <CreditCard size={24} />}
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <WalletActionsMenu wallet={wallet} />
                                        </div>
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-lg">{wallet.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4">{wallet.type.replace('_', ' ')}</p>
                                    <p className={`text-slate-800 font-semibold transition-all duration-300 ${balanceStyle}`}>{formatCurrency(parseFloat(wallet.balance), currency)}</p>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Dots Indicator (Mobile Only) */}
                <div className="flex justify-center gap-2 mt-2 sm:hidden">
                    {wallets.slice(0, 4).map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                activeIndex === index ? "w-6 bg-primary" : "w-2 bg-slate-200"
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
