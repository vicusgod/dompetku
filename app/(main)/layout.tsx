import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import { SettingsProvider } from '@/components/providers/settings-provider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SettingsProvider>
            <DashboardLayoutClient>
                {children}
            </DashboardLayoutClient>
        </SettingsProvider>
    );
}
