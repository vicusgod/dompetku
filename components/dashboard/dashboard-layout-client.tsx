'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/components/providers/auth-provider';

const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/wallets', label: 'Wallets', icon: 'account_balance_wallet' },
    { href: '/transactions', label: 'Transactions', icon: 'receipt_long' },
    { href: '/budget', label: 'Budget', icon: 'donut_small' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { isGuest, logoutGuest } = useAuth();

    const handleLogout = async () => {
        if (isGuest) {
            logoutGuest();
        } else {
            await supabase.auth.signOut();
            router.push('/');
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-purple-300/20 rounded-full blur-[80px]"></div>
            </div>
            <div className="flex h-screen w-full">
                {/* Desktop Sidebar - Hidden on Mobile */}
                <aside className="hidden md:flex glass-sidebar w-64 h-full flex-shrink-0 flex-col justify-between p-6 z-20">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 px-2">
                            <Image
                                src="/logo.svg"
                                alt="Dompetku Logo"
                                width={40}
                                height={40}
                                className="size-10 shadow-lg shadow-primary/30 rounded-xl"
                            />
                            <h1 className="text-slate-800 text-xl font-bold tracking-tight">dompetku</h1>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                            ? 'bg-primary shadow-lg shadow-primary/20'
                                            : 'hover:bg-black/5 text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-current'
                                                }`}
                                            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className={`text-sm ${isActive ? 'text-white font-semibold' : 'font-medium'}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <div className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 transition-all cursor-pointer text-slate-500 hover:text-slate-900 mt-auto">
                                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-red-50 transition-colors">
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-red-500 transition-colors text-[20px]">logout</span>
                                </div>
                                <span className="text-sm font-medium group-hover:text-red-600 transition-colors">Sign Out</span>
                            </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl gap-4 md:gap-6 sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
                                    {isGuest ? 'End Guest Session?' : 'Are you sure you want to sign out?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-slate-500">
                                    {isGuest
                                        ? 'All your local data (transactions, wallets, budgets) will be permanently deleted. This action cannot be undone.'
                                        : 'You will need to sign in again to access your wallet and transactions.'}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="sm:justify-center sm:space-x-4">
                                <AlertDialogCancel className="rounded-2xl h-12 px-6 font-semibold border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all sm:w-auto w-full">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleLogout}
                                    className="rounded-2xl h-12 px-6 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all sm:w-auto w-full"
                                >
                                    {isGuest ? 'End Session & Delete Data' : 'Sign Out'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </aside>

                {/* Mobile Navigation - Hidden on Desktop */}
                <MobileNav />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden pb-16 md:pb-0">
                    {children}
                </main>
            </div>
        </>
    );
}
