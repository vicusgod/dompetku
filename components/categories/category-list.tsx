'use client';

import { Button } from '@/components/ui/button';
import { CategoryDialog, categoryIcons } from './category-dialog';
import { Plus, ArrowDown, ArrowUp, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useCategories, useDeleteCategory } from '@/hooks/use-data';
import { toast } from 'sonner';
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
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryList() {
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Use unified hooks for data
    const { data: categories = [], isLoading } = useCategories();
    const deleteCategoryMutation = useDeleteCategory();

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCategoryMutation.mutateAsync(deletingId);
            toast.success('Category deleted');
            setDeletingId(null);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete category');
        }
    };

    // Separate categories by type
    const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');
    const incomeCategories = categories.filter((c: any) => c.type === 'INCOME');

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col gap-4 bg-white z-10 relative">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Categories</h2>
                    <p className="text-sm text-slate-500">Manage categories for transactions.</p>
                </div>
                <CategoryDialog trigger={
                    <Button className="w-full rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all h-10 text-sm">
                        <Plus className="size-[18px] mr-2" />
                        Add Category
                    </Button>
                } />
            </div>

            <div className="px-6 pb-6 space-y-6 bg-white">
                {/* Expense Categories */}
                <div className="bg-slate-100/50 rounded-2xl p-5 border border-slate-200/60">
                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                        <span className="flex items-center justify-center size-6 rounded-full bg-rose-100 text-rose-600">
                            <ArrowDown className="size-[14px]" />
                        </span>
                        Expense Categories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {expenseCategories.length === 0 ? (
                            <p className="text-slate-400 text-sm py-8 text-center col-span-full bg-white rounded-xl border border-dashed border-slate-200">No expense categories.</p>
                        ) : (
                            expenseCategories.map((cat: any) => (
                                <CategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onEdit={() => setEditingCategory(cat)}
                                    onDelete={() => setDeletingId(cat.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Income Categories */}
                <div className="bg-slate-100/50 rounded-2xl p-5 border border-slate-200/60">
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                        <span className="flex items-center justify-center size-6 rounded-full bg-emerald-100 text-emerald-600">
                            <ArrowUp className="size-[14px]" />
                        </span>
                        Income Categories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {incomeCategories.length === 0 ? (
                            <p className="text-slate-400 text-sm py-8 text-center col-span-full bg-white rounded-xl border border-dashed border-slate-200">No income categories.</p>
                        ) : (
                            incomeCategories.map((cat: any) => (
                                <CategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onEdit={() => setEditingCategory(cat)}
                                    onDelete={() => setDeletingId(cat.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            {editingCategory && (
                <CategoryDialog
                    category={editingCategory}
                    open={!!editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this category? This might fail if you have transactions linked to it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteCategoryMutation.isPending}
                        >
                            {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Category Item Component
function CategoryItem({ category, onEdit, onDelete }: { category: any; onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="py-2.5 px-3 flex items-center justify-between group bg-white hover:bg-slate-50 transition-all rounded-xl border border-slate-200/60 shadow-xs hover:shadow-md hover:border-slate-300">
            <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center text-white shadow-sm ${category.type === 'INCOME' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    {(() => {
                        const Icon = categoryIcons[category.icon] || LayoutGrid;
                        return <Icon className="size-[18px]" />;
                    })()}
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 text-sm">{category.name}</h3>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="size-7 rounded-lg hover:bg-slate-200 text-slate-500" onClick={onEdit}>
                    <Edit2 className="size-[16px]" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500" onClick={onDelete}>
                    <Trash2 className="size-[16px]" />
                </Button>
            </div>
        </div>
    );
}
