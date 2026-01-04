'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { transactionSchema } from '@/lib/validators';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateTransaction, useWallets, useCategories } from '@/hooks/use-data';
import { useSettings } from '@/components/providers/settings-provider';
import { getCurrencySymbol } from '@/lib/utils';

interface AddTransactionDialogProps {
    trigger?: React.ReactNode;
}

// Extend the schema locally to include time
// Extend the schema locally to include time and handle string amount
const formSchema = transactionSchema.extend({
    time: z.string(),
    amount: z.union([z.string(), z.number()])
        .transform((v) => Number(v) || 0)
        .pipe(z.number().positive('Amount must be greater than 0')),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransactionDialog({ trigger }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);

    // Use unified data hooks (works for both Auth and Guest)
    const { data: categories = [] } = useCategories();
    const { data: wallets = [] } = useWallets();
    const createTransactionMutation = useCreateTransaction();

    // Form setup
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: 0,
            type: 'EXPENSE',
            date: new Date(),
            note: '',
            walletId: '',
            time: format(new Date(), 'HH:mm'),
        },
    });

    // Set default wallet
    useEffect(() => {
        if (wallets.length > 0 && !form.getValues('walletId')) {
            const defaultWallet = wallets.find((w) => w.type === 'CASH') || wallets[0];
            if (defaultWallet) {
                form.setValue('walletId', defaultWallet.id);
            }
        }
    }, [wallets, form]);

    async function onSubmit(data: FormValues) {
        try {
            // Combine date and time
            const combinedDate = new Date(data.date);
            const [hours, minutes] = data.time.split(':').map(Number);
            combinedDate.setHours(hours, minutes);

            if (!data.walletId) {
                toast.error('Wallet is required');
                return;
            }

            await createTransactionMutation.mutateAsync({
                ...data,
                walletId: data.walletId,
                date: combinedDate.toISOString(),
            });

            toast.success('Transaction added successfully');
            form.reset({
                amount: 0,
                type: 'EXPENSE',
                date: new Date(),
                note: '',
                walletId: wallets[0]?.id || '',
                time: format(new Date(), 'HH:mm'),
            });
            setOpen(false);
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    }

    const type = form.watch('type');
    const isPending = createTransactionMutation.isPending;

    const settings = useSettings();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl gap-6 bg-white overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-extrabold text-slate-900">Add Transaction</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                        {/* Type Toggle */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <div className="flex p-1 bg-slate-100/80 border border-slate-200 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => field.onChange('EXPENSE')}
                                        className={cn(
                                            "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                            field.value === 'EXPENSE' ? "bg-white text-rose-500 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => field.onChange('INCOME')}
                                        className={cn(
                                            "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                            field.value === 'INCOME' ? "bg-white text-emerald-500 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                        Income
                                    </button>
                                </div>
                            )}
                        />

                        {/* Amount Input */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</FormLabel>
                                    <div className="group relative">
                                        <div className="flex items-center h-16 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 transition-all focus-within:bg-white focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                                            <span className="mr-2 text-3xl font-extrabold text-primary transition-colors group-focus-within:text-blue-600 shrink-0 select-none">
                                                {getCurrencySymbol(settings.currency)}
                                            </span>
                                            <FormControl>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value === 0 ? '' : field.value}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
                                                            value = value.replace(/^0+/, '');
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                    className="h-full w-full bg-transparent text-3xl font-extrabold outline-none placeholder:text-slate-300"
                                                />
                                            </FormControl>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </div>
                            )}
                        />

                        {/* Wallet & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="walletId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl font-semibold text-slate-700">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {wallets.map((wallet) => (
                                                    <SelectItem key={wallet.id} value={wallet.id}>
                                                        {wallet.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl font-semibold text-slate-700">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.filter((c) => c.type === type).map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 pl-3 text-left font-semibold border-slate-200 bg-slate-50/50 hover:bg-white rounded-2xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd MMM yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Manual Time Field */}
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="time"
                                                    className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl font-semibold text-slate-700 block w-full"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Note */}
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Add a note..."
                                            className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl font-medium"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 mt-2",
                                isPending ? "opacity-50" : "hover:translate-y-[-2px] transition-transform"
                            )}
                        >
                            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Save Transaction
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
