'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState, useTransition, useRef } from 'react';
import { updateSetting } from '@/actions/settings';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { logout } from '@/actions/auth';
import { useSettings } from '@/components/providers/settings-provider';
import { LogOut, Trash2, Pencil, User, EyeOff } from 'lucide-react';

interface GeneralSettingsFormProps {
    initialSettings: {
        currency: string;
        language: string;
        hideBalances: boolean;
    };
    initialProfile?: {
        displayName: string;
        email: string;
        photoUrl?: string;
    };
}

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
} from "@/components/ui/alert-dialog";

function LogoutButton() {
    const { isGuest, logoutGuest } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        if (isGuest) {
            logoutGuest();
        } else {
            await logout();
        }
    };

    if (isGuest) {
        return (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="h-12 w-12 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-500 shadow-sm shrink-0">
                    <LogOut size={24} />
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={isLoggingOut}
                            className="bg-red-500 hover:bg-red-600 h-10 flex-1 w-full text-sm font-bold rounded-xl shadow-sm shadow-red-200"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout Guest'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Exit Guest Mode?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will <b>permanently delete</b> all your local transaction and wallet data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600">
                                Yes, Delete & Exit
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-red-500 border border-red-100">
                        <LogOut size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Logout Account</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Sign out of your account.
                        </p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={isLoggingOut}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Logout Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to sign out? You can log back in with your credentials.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600">
                                Yes, Logout
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-red-500 border border-red-100">
                        <Trash2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Delete Account</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Permanently delete your account and data.
                        </p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will <b>permanently delete</b> all your transactions, wallets, and categories.
                                <br /><br />
                                This action cannot be undone. Are you sure?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    const { deleteAccount } = await import('@/actions/user');
                                    await deleteAccount();
                                }}
                                className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
                            >
                                Yes, Delete My Account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

function EditProfileDialog({ profile, onSave }: { profile: { displayName: string; email: string; photoUrl?: string }; onSave: (data: { displayName: string; email: string; photoUrl?: string }) => void }) {
    const [open, setOpen] = useState(false);
    const [displayName, setDisplayName] = useState(profile.displayName);
    const [email, setEmail] = useState(profile.email);
    const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoUrl || null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // For now, we save to localStorage for guests or show a toast for authenticated users
            onSave({ displayName, email, photoUrl: photoPreview || undefined });
            toast.success('Profile updated');
            setOpen(false);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 rounded-lg text-xs font-semibold">
                    <Pencil size={14} />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 py-4">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="size-24 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-slate-300 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={36} />
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                            Change Photo
                        </button>
                    </div>

                    {/* Display Name */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-900">Display Name</span>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your display name"
                        />
                    </label>

                    {/* Email */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-900">Email Address</span>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            type="email"
                        />
                    </label>

                    {/* Save Button */}
                    <Button onClick={handleSave} disabled={isSaving} className="w-full">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function GeneralSettingsForm({ initialSettings, initialProfile }: GeneralSettingsFormProps) {
    const [isPending, startTransition] = useTransition();
    // Use context for settings
    const { updateSettings, ...contextSettings } = useSettings();
    const settings = contextSettings;

    const [profile, setProfile] = useState(initialProfile || { displayName: 'Demo User', email: 'demo@example.com', photoUrl: undefined as string | undefined });
    const router = useRouter();

    const handleSettingChange = (key: string, value: string | boolean) => {
        const newValue = String(value);

        // Update context immediately (optimistic UI update within the app)
        updateSettings({ [key]: value });

        startTransition(async () => {
            await updateSetting(key, newValue);
            router.refresh(); // Refresh server components
            toast.success('Setting updated');
        });
    };

    const handleProfileUpdate = (data: typeof profile) => {
        startTransition(async () => {
            // Optimistically update
            setProfile(data);

            const { updateUserProfile } = await import('@/actions/settings');
            const result = await updateUserProfile(data);

            if (result.success) {
                toast.success('Profile updated');
                router.refresh();
            } else {
                toast.error('Failed to update profile');
                // Revert optimistic update? Or just let it be since it's local
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            {/* Section 1: Personal Information */}
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">Personal Information</h2>
                    <EditProfileDialog profile={profile} onSave={handleProfileUpdate} />
                </div>
                <div className="flex flex-col md:flex-row gap-8 w-full">
                    {/* Avatar Display */}
                    <div className="flex flex-col gap-3 items-center md:items-start shrink-0">
                        <div className="size-24 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-slate-300 overflow-hidden">
                            {profile.photoUrl ? (
                                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={36} />
                            )}
                        </div>
                    </div>
                    {/* Display Fields (Read-only) */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-900">Display Name</span>
                            <p className="text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-100">{profile.displayName}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-900">Email Address</span>
                            <p className="text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-100">{profile.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Preferences */}
            <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Regional Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-900">Default Currency</span>
                        <Select
                            value={settings.currency}
                            onValueChange={(val) => handleSettingChange('currency', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD - United States Dollar</SelectItem>
                                <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-slate-500">This currency will be used for all aggregated reports.</span>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-900">Language</span>
                        <Select
                            value={settings.language}
                            onValueChange={(val) => handleSettingChange('language', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </label>
                </div>
            </div>

            {/* Section 3: App Behavior & Privacy */}
            <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Privacy & Interface</h2>
                <div className="flex flex-col gap-4 w-full">
                    {/* Toggle Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-slate-500 border border-slate-100">
                                <EyeOff size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Hide balances by default</p>
                                <p className="text-xs text-slate-500 mt-0.5">Blur sensitive numbers on dashboard load.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.hideBalances}
                            onCheckedChange={(checked) => handleSettingChange('hideBalances', checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Section 4: Account / Session */}
            <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Account</h2>
                <div className="flex flex-col gap-4 w-full">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
