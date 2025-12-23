import { z } from 'zod';

export const transactionSchema = z.object({
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string({ message: 'Please select a category' }).min(1, 'Please select a category'),
    walletId: z.string().optional(),
    date: z.date({ message: 'Date is required' }),
    note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
