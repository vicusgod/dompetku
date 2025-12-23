import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import { getSettings } from '@/actions/settings';
import { SettingsProvider } from '@/components/providers/settings-provider';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettings();

    return (
        <SettingsProvider initialSettings={settings}>
            <DashboardLayoutClient>
                {children}
            </DashboardLayoutClient>
        </SettingsProvider>
    );
}
