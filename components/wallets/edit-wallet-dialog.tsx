'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUpdateWallet, useDeleteWallet } from '@/hooks/use-data';
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
} from '@/components/ui/alert-dialog';

const walletFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['CASH', 'BANK', 'E_WALLET']),
    balance: z.coerce.number().min(0, 'Balance cannot be negative'),
});

type WalletFormValues = z.infer<typeof walletFormSchema>;

interface EditWalletDialogProps {
    wallet: any;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditWalletDialog({ wallet, trigger, open: controlledOpen, onOpenChange }: EditWalletDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
    const setIsOpen = isControlled ? onOpenChange : setUncontrolledOpen;
    const router = useRouter();

    const updateWalletMutation = useUpdateWallet();
    const isPending = updateWalletMutation.isPending;

    const form = useForm<WalletFormValues>({
        resolver: zodResolver(walletFormSchema) as any,
        defaultValues: {
            name: wallet.name,
            type: wallet.type,
            balance: parseFloat(wallet.balance),
        },
    });

    const deleteWalletMutation = useDeleteWallet();

    async function onSubmit(data: WalletFormValues) {
        try {
            await updateWalletMutation.mutateAsync({
                id: wallet.id,
                data: data,
            });
            toast.success('Wallet updated successfully');
            setIsOpen?.(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await deleteWalletMutation.mutateAsync(wallet.id);
            toast.success('Wallet deleted');
            setIsOpen?.(false);
            // router.refresh(); // Or navigate if needed, usually React Query handles UI update
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete wallet');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Wallet</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="BANK">Bank Account</SelectItem>
                                            <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. BCA, OVO, Main Cache" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="balance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Balance</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </Form>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                </div>

                <div className="flex justify-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full">
                                Delete Wallet
                            </Button>
                        </AlertDialogTrigger>
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
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DialogContent>
        </Dialog>
    );
}
