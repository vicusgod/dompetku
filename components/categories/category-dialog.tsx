'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-data';
import {
    ShoppingCart, Utensils, Bus, Banknote, GraduationCap,
    Heart, Plane, PiggyBank, Briefcase, Home, Dog, Dumbbell,
    Film, Coffee, Gift, Wrench, LucideIcon
} from 'lucide-react';

interface CategoryDialogProps {
    trigger?: React.ReactNode;
    category?: any; // If passed, we are in edit mode
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// Map icon name to Lucide component
const ICONS: { name: string; icon: LucideIcon }[] = [
    { name: 'shopping_cart', icon: ShoppingCart },
    { name: 'restaurant', icon: Utensils },
    { name: 'commute', icon: Bus },
    { name: 'payments', icon: Banknote },
    { name: 'school', icon: GraduationCap },
    { name: 'medical_services', icon: Heart },
    { name: 'flight', icon: Plane },
    { name: 'savings', icon: PiggyBank },
    { name: 'work', icon: Briefcase },
    { name: 'home', icon: Home },
    { name: 'pets', icon: Dog },
    { name: 'fitness_center', icon: Dumbbell },
    { name: 'movie', icon: Film },
    { name: 'local_cafe', icon: Coffee },
    { name: 'gift', icon: Gift },
    { name: 'build', icon: Wrench },
];

export function CategoryDialog({ trigger, category, open: controlledOpen, onOpenChange: setControlledOpen }: CategoryDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            type: formData.get('type') as 'INCOME' | 'EXPENSE',
            icon: formData.get('icon') as string,
            color: '#3b82f6', // Default blue for now
        };

        try {
            if (category) {
                // Update existing category using the hook
                await updateCategoryMutation.mutateAsync({ id: category.id, data });
                toast.success('Category updated');
            } else {
                // Create new category
                await createCategoryMutation.mutateAsync(data);
                toast.success('Category created');
            }
            setOpen?.(false);
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={category?.name}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select name="type" defaultValue={category?.type || 'EXPENSE'}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Income</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Icon</Label>
                        <div className="col-span-3 grid grid-cols-8 gap-2">
                            {ICONS.map(({ name: iconName, icon: IconComponent }) => (
                                <label key={iconName} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="icon"
                                        value={iconName}
                                        className="peer sr-only"
                                        defaultChecked={category?.icon === iconName || (!category && iconName === 'shopping_cart')}
                                    />
                                    <div className="size-8 rounded-md flex items-center justify-center border border-transparent peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:border-primary hover:bg-slate-50 transition-all">
                                        <IconComponent size={18} />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

