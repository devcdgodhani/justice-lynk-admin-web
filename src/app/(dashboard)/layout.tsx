'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { accessToken, isHydrated } = useAuthStore();
    const { sidebarCollapsed } = useUIStore();

    useEffect(() => {
        if (isHydrated && !accessToken) {
            router.replace('/login');
            return;
        }
    }, [accessToken, router, isHydrated]);

    if (!isHydrated || !accessToken) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className={cn(
                'flex-1 flex flex-col overflow-hidden transition-all duration-300',
                sidebarCollapsed ? 'ml-16' : 'ml-64',
            )}>
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="max-w-7xl mx-auto page-enter">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
