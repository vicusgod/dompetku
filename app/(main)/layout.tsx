import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import { getSettings } from '@/actions/settings';
import { SettingsProvider } from '@/components/providers/settings-provider';
import { SyncProvider } from '@/components/providers/sync-provider';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettings();

    return (
        <SettingsProvider initialSettings={settings}>
            <SyncProvider>
                <DashboardLayoutClient>
                    {children}
                </DashboardLayoutClient>
            </SyncProvider>
        </SettingsProvider>
    );
}
