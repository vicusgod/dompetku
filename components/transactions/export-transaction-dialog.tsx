'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { LocalDataStore } from '@/lib/local-store';
import { useWallets } from '@/hooks/use-data';

export function ExportTransactionDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
    const { data: wallets = [] } = useWallets();

    const handleExport = () => {
        const transactions = LocalDataStore.getTransactions();

        let filtered = transactions;
        if (startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= startDate);
        }
        if (endDate) {
            // Set end date to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => new Date(t.date) <= end);
        }
        if (selectedWalletId && selectedWalletId !== 'all') {
            filtered = filtered.filter(t => t.walletId === selectedWalletId);
        }

        if (!filtered.length) return;

        const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note'];
        const csvContent = [
            headers.join(','),
            ...filtered.map((t) => {
                const walletName = t.walletId ? wallets.find((w: any) => w.id === t.walletId)?.name || 'Unknown' : 'Main Wallet';
                const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : '';
                return [
                    format(new Date(t.date), 'yyyy-MM-dd'),
                    t.type,
                    LocalDataStore.getCategories().find(c => c.id === t.categoryId)?.name || 'Uncategorized',
                    walletName,
                    t.amount,
                    note
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Transactions</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Start Date (Optional)</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">End Date (Optional)</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Wallet (Optional)</span>
                        <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Wallets</SelectItem>
                                {wallets.map((wallet: any) => (
                                    <SelectItem key={wallet.id} value={wallet.id}>
                                        {wallet.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleExport} className="w-full">Export CSV</Button>
            </DialogContent>
        </Dialog>
    );
}
