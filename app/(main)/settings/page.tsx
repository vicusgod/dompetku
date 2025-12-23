'use client';

import { GeneralSettingsForm } from '@/components/settings/general-settings-form';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { CategoryList } from '@/components/categories/category-list';
import { useSettings } from '@/components/providers/settings-provider';
import { useAuth } from '@/components/providers/auth-provider';

export default function SettingsPage() {
    const settings = useSettings();
    const { user } = useAuth();

    // Default profile for guest mode or fallback
    let profile = {
        displayName: 'Demo User',
        email: 'demo@example.com',
        photoUrl: undefined as string | undefined
    };

    if (user) {
        profile = {
            displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            photoUrl: user.user_metadata?.avatar_url
        };
    }

    // Prepare settings object expected by form
    const initialSettings = {
        currency: settings.currency,
        language: settings.language,
        hideBalances: settings.hideBalances
    };

    return (
        <div className="flex-1 h-full overflow-y-auto">
            <div className="max-w-[1400px] w-full mx-auto p-6 md:p-8">
                <main className="flex-1 min-w-0 mb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1A1A2E] mb-2">Settings</h1>
                            <p className="text-[#6E6E85] text-sm md:text-base font-medium max-w-lg">Manage your personal details, categories, and application defaults.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-100 p-2 rounded-full max-w-[400px]">
                            <TabsTrigger value="general" className="rounded-full font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">General</TabsTrigger>
                            <TabsTrigger value="categories" className="rounded-full font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Categories</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="outline-none">
                            <GeneralSettingsForm initialSettings={initialSettings} initialProfile={profile} />
                        </TabsContent>

                        <TabsContent value="categories" className="outline-none">
                            <CategoryList />
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}

