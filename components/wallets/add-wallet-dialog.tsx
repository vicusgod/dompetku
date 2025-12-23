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
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateWallet } from '@/hooks/use-data';

const walletFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['CASH', 'BANK', 'E_WALLET']),
    balance: z.coerce.number().min(0, 'Balance cannot be negative'),
});

type WalletFormValues = z.infer<typeof walletFormSchema>;

interface AddWalletDialogProps {
    trigger?: React.ReactNode;
}

export function AddWalletDialog({ trigger }: AddWalletDialogProps) {
    const [open, setOpen] = useState(false);
    const createWalletMutation = useCreateWallet();

    const form = useForm<WalletFormValues>({
        resolver: zodResolver(walletFormSchema) as any,
        defaultValues: {
            name: '',
            type: 'BANK',
            balance: 0,
        },
    });

    async function onSubmit(data: WalletFormValues) {
        try {
            await createWalletMutation.mutateAsync(data);
            toast.success('Wallet created successfully');
            form.reset();
            setOpen(false);
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Wallet
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Wallet</DialogTitle>
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
                                    <FormLabel>Initial Balance</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={createWalletMutation.isPending}>
                            {createWalletMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Wallet
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
