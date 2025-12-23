'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditWalletDialog } from './edit-wallet-dialog';
import { Wallet, Landmark, CreditCard, History, Pencil } from 'lucide-react';

interface WalletCardProps {
    wallet: any;
    index: number;
    settings?: {
        currency: string;
        hideBalances: boolean;
    };
}

export function WalletCard({ wallet, index, settings }: WalletCardProps) {
    const currency = settings?.currency || 'IDR';
    const hideBalances = settings?.hideBalances || false;
    const balanceStyle = hideBalances ? "blur-md select-none" : "";

    const styles = [
        { color: 'blue', bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-600' },
        { color: 'purple', bg: 'bg-purple-500', light: 'bg-purple-500/10', text: 'text-purple-600' },
        { color: 'pink', bg: 'bg-pink-500', light: 'bg-pink-500/10', text: 'text-pink-600' },
        { color: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-600' },
        { color: 'amber', bg: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-600' },
        { color: 'cyan', bg: 'bg-cyan-500', light: 'bg-cyan-500/10', text: 'text-cyan-600' },
    ];
    const style = styles[index % styles.length];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-glass hover:-translate-y-1 transition-all duration-300 border border-white relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${style.bg}`}></div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${style.light} flex items-center justify-center ${style.text}`}>
                        {wallet.type === 'CASH' ? <Wallet size={22} /> : wallet.type === 'BANK' ? <Landmark size={22} /> : <CreditCard size={22} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-[#1A1A2E] leading-tight">{wallet.name}</h4>
                        <p className="text-xs text-[#6E6E85] font-medium">{wallet.type.replace('_', ' ')}</p>
                    </div>
                </div>

            </div>
            <div className="mb-6">
                <p className="text-xs font-bold text-[#6E6E85] uppercase tracking-wide mb-1">Available Balance</p>
                <p className={`text-2xl font-black text-[#1A1A2E] tracking-tight transition-all duration-300 ${balanceStyle}`}>{formatCurrency(parseFloat(wallet.balance), currency)}</p>
            </div>
            <div className="flex gap-3">
                <Link href={`/transactions?walletId=${wallet.id}`} className="flex-1 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-[#1A1A2E] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <History size={18} />
                    History
                </Link>
                <EditWalletDialog wallet={wallet} trigger={
                    <button className="flex-1 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-[#1A1A2E] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                        <Pencil size={18} />
                        Edit
                    </button>
                } />
            </div>
        </div >
    );
}
