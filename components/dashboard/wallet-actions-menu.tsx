'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditWalletDialog } from '@/components/wallets/edit-wallet-dialog';
import { useDeleteWallet } from '@/hooks/use-data';
import { toast } from 'sonner';
import { Pencil, Trash2, History, MoreHorizontal } from 'lucide-react';

interface WalletActionsMenuProps {
    wallet: any;
}

export function WalletActionsMenu({ wallet }: WalletActionsMenuProps) {
    const [open, setOpen] = useState(false); // Dropdown state
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const router = useRouter();

    const deleteWalletMutation = useDeleteWallet();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await deleteWalletMutation.mutateAsync(wallet.id);
            toast.success('Wallet deleted');
            setShowDeleteAlert(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete wallet');
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => router.push(`/transactions?walletId=${wallet.id}`)}>
                        <History className="mr-2 h-4 w-4" />
                        History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => setShowDeleteAlert(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditWalletDialog
                wallet={wallet}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Wallet?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{wallet.name}</strong>? This action cannot be undone and will delete all associated transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            {deleteWalletMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
