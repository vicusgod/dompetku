'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBudgets, deleteBudget } from '@/actions/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists or I'll implement a local helper if not

export function BudgetList() {
    const queryClient = useQueryClient();
    const { data: budgets = [], isLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => await getBudgets(),
    });

    const handleDelete = async (id: string) => {
        const result = await deleteBudget(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Budget removed');
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }
    };

    if (isLoading) {
        return <div>Loading budgets...</div>;
    }

    if (budgets.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No budgets set. Start by creating one!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget: any) => {
                const amount = parseFloat(budget.amount);
                const spent = budget.spent || 0;
                const percentage = Math.min(100, (spent / amount) * 100);
                const isOverBudget = spent > amount;

                return (
                    <Card key={budget.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {budget.categoryName}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(budget.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                            <p className="text-xs text-muted-foreground mb-4">
                                Spent: {formatCurrency(spent)}
                            </p>
                            <Progress value={percentage} className={isOverBudget ? "bg-red-100 [&>div]:bg-red-500" : ""} />
                            <div className="mt-2 text-xs flex justify-between">
                                <span>{percentage.toFixed(0)}% used</span>
                                {isOverBudget ? (
                                    <span className="text-red-500 font-medium flex items-center">
                                        <AlertTriangle className="mr-1 h-3 w-3" /> Over budget
                                    </span>
                                ) : (
                                    <span className="text-green-500 font-medium flex items-center">
                                        <CheckCircle className="mr-1 h-3 w-3" /> On track
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
