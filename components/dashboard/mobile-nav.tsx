'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/wallets', label: 'Wallets', icon: 'account_balance_wallet' },
    { href: '/transactions', label: 'Transactions', icon: 'receipt_long' },
    { href: '/budget', label: 'Budget', icon: 'donut_small' }, // Mapped Reports to Budget
    { href: '/settings', label: 'Settings', icon: 'settings' },
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
                            <span
                                className={`material-symbols-outlined text-[24px] ${isActive ? 'font-variation-filled' : ''}`}
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
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
