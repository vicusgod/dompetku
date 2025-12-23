'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
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
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCategories, useCreateBudget } from '@/hooks/use-data';

const budgetFormSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    period: z.enum(['MONTHLY']),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface AddBudgetDialogProps {
    trigger?: React.ReactNode;
}

export function AddBudgetDialog({ trigger }: AddBudgetDialogProps) {
    const [open, setOpen] = useState(false);

    // Use unified data hooks (works for both Auth and Guest)
    const { data: categories = [] } = useCategories();
    const createBudgetMutation = useCreateBudget();

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetFormSchema) as any,
        defaultValues: {
            categoryId: '',
            amount: 0,
            period: 'MONTHLY',
        },
    });

    // Filter categories that are EXPENSE type
    const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');

    async function onSubmit(data: BudgetFormValues) {
        try {
            await createBudgetMutation.mutateAsync(data);
            toast.success('Budget created successfully');
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    }

    const isPending = createBudgetMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Budget
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-6 rounded-3xl gap-6 bg-white">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-extrabold text-slate-900">Set Monthly Budget</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                        {/* Category Select */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl font-semibold text-slate-700">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {expenseCategories.map((category: any) => (
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

                        {/* Amount Input */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Limit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            {...field}
                                            className="h-14 pl-4 text-xl font-bold border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary/50 transition-all rounded-2xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="h-12 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25 mt-2 bg-[#1d3cdd] hover:bg-[#152cad] transition-all hover:translate-y-[-2px]"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Save Budget
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
