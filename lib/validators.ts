import { z } from 'zod';

export const transactionSchema = z.object({
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string({ message: 'Please select a category' }).uuid('Invalid category'),
    walletId: z.string().uuid('Invalid wallet').optional(),
    date: z.date({ message: 'Date is required' }),
    note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
