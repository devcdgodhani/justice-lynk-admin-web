'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Building2,
    Scale,
    CreditCard,
    Bell,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/services/auth.api';
import { cn, getInitials } from '@/lib/utils';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
    { href: '/admin/professionals', label: 'Professionals', icon: Scale },
    { href: '/admin/billing', label: 'Subscriptions', icon: CreditCard },
    { href: '/notifications', label: 'System Logs', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            clearAuth();
            document.cookie = 'jl-access-token=; path=/; max-age=0';
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col',
                sidebarCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-20 flex items-center px-6 gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                    <Scale className="w-5 h-5 text-primary-foreground" />
                </div>
                {!sidebarCollapsed && (
                    <span className="text-xl font-bold font-display tracking-tight text-sidebar-foreground">
                        Justice<span className="text-primary-foreground/60">Lynk</span>
                    </span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-premium">
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                            sidebarCollapsed ? 'justify-center' : '',
                            isActive(href)
                                ? 'bg-primary-foreground/10 text-primary-foreground shadow-sm ring-1 ring-primary-foreground/20'
                                : 'text-sidebar-foreground/70 hover:bg-primary-foreground/5 hover:text-sidebar-foreground',
                        )}
                        title={sidebarCollapsed ? label : undefined}
                    >
                        <Icon className={cn('flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110', isActive(href) ? 'text-primary' : '')} />
                        {!sidebarCollapsed && <span className="truncate tracking-wide">{label}</span>}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="p-4 flex-shrink-0">
                <div className={cn(
                    "rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 transition-colors hover:bg-primary-foreground/10",
                    sidebarCollapsed && "p-2 flex flex-col items-center gap-2"
                )}>
                    {!sidebarCollapsed && user ? (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-primary-foreground text-sm font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-primary-foreground truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-primary-foreground/40 truncate font-medium">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        user && (
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-md">
                                    <span className="text-primary-foreground text-sm font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            </div>
                        )
                    )}

                    <button
                        onClick={handleLogout}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all w-full group',
                            sidebarCollapsed ? 'justify-center' : '',
                        )}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut className="flex-shrink-0 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        {!sidebarCollapsed && <span className="font-semibold px-2">Sign out</span>}
                    </button>
                </div>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={toggleSidebarCollapsed}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-primary-foreground/10 transition-all shadow-lg active:scale-90"
            >
                {sidebarCollapsed
                    ? <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                    : <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
                }
            </button>
        </aside>
    );
}
