'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    LayoutDashboard,
    Wallet,
    ReceiptText,
    PieChart,
    Settings
} from 'lucide-react';

const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/wallets', label: 'Wallets', icon: Wallet },
    { href: '/transactions', label: 'Transactions', icon: ReceiptText },
    { href: '/budget', label: 'Budget', icon: PieChart },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-slate-200 md:hidden z-50 pb-safe">
            <nav className="flex h-full items-center justify-around px-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <item.icon className="size-6" />
                            <span className="text-[10px] font-medium truncate max-w-full">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
