'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SettingsSidebar() {
    const pathname = usePathname();

    const items = [
        { href: '/settings', label: 'General', icon: 'settings' },
        { href: '/settings/profile', label: 'Profile', icon: 'person' },
        { href: '/settings/wallets', label: 'My Wallets', icon: 'account_balance_wallet' },
        { href: '/settings/notifications', label: 'Notifications', icon: 'notifications' },
        { href: '/settings/notifications', label: 'Notifications', icon: 'notifications' },
    ];

    const systemItems = [
        { href: '/settings/security', label: 'Security', icon: 'lock' },
        { href: '/settings/export', label: 'Data & Export', icon: 'download' },
    ];

    return (
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <div className="flex flex-col min-w-0">
                    <h1 className="text-slate-900 text-base font-bold leading-tight truncate">Demo User</h1>
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 w-fit">
                        Pro Plan
                    </span>
                </div>
            </div>

            <nav className="flex flex-col gap-1">
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account</h3>
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${pathname === item.href ? 'fill-current' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm ${pathname === item.href ? 'font-bold' : 'font-medium'}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}

                <div className="my-2 h-px bg-slate-100 mx-3"></div>

                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">System</h3>
                {systemItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${pathname === item.href ? 'fill-current' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm ${pathname === item.href ? 'font-bold' : 'font-medium'}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
