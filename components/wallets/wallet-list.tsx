'use client';

// import { getWallets, deleteWallet } from '@/actions/wallets'; // Removed
import { useWallets, useDeleteWallet } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Wallet, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { AddWalletDialog } from './add-wallet-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export function WalletList() {
    const queryClient = useQueryClient();
    const { data: wallets = [], isLoading } = useWallets();
    const deleteWalletMutation = useDeleteWallet();

    const handleDelete = (id: string) => {
        deleteWalletMutation.mutate(id);
    };

    if (isLoading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'CASH': return <Banknote className="h-5 w-5" />;
            case 'BANK': return <CreditCard className="h-5 w-5" />;
            case 'E_WALLET': return <Wallet className="h-5 w-5" />;
            default: return <Wallet className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
                    <p className="text-muted-foreground">Manage your accounts and balances.</p>
                </div>
                <AddWalletDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wallets.map((wallet: any) => (
                    <Card key={wallet.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {wallet.type.replace('_', ' ')}
                            </CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(wallet.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    {getIcon(wallet.type)}
                                </div>
                                <div className="text-xl font-bold">{wallet.name}</div>
                            </div>
                            <div className="text-2xl font-bold">
                                ${parseFloat(wallet.balance).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {wallets.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        <Wallet className="h-8 w-8 mb-2 opacity-50" />
                        <p>No wallets found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
