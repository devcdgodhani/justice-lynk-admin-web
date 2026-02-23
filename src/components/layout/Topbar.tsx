'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { notificationsApi } from '@/services/notifications.api';
import { authApi } from '@/services/auth.api';
import { getInitials, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function Topbar() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const { toggleSidebar } = useUIStore();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: unreadRes } = useQuery({
        queryKey: ['notifications-unread'],
        queryFn: notificationsApi.getUnreadCount,
        refetchInterval: 30000,
        enabled: !!user,
    });

    const { data: notifsRes } = useQuery({
        queryKey: ['notifications-preview'],
        queryFn: () => notificationsApi.getNotifications(1, 5),
        enabled: notifOpen && !!user,
    });

    const markAllRead = useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
            toast.success('All notifications marked as read');
        },
    });

    const unreadCount = unreadRes?.data?.count ?? 0;
    const notifications = notifsRes?.data?.items ?? [];

    const handleLogout = async () => {
        try { await authApi.logout(); } catch { }
        clearAuth();
        document.cookie = 'jl-access-token=; path=/; max-age=0';
        router.push('/login');
    };

    return (
        <header className="h-20 bg-background/60 border-b border-border/40 flex items-center justify-between px-8 flex-shrink-0 backdrop-blur-xl sticky top-0 z-30">
            {/* Left side */}
            <div className="flex items-center gap-6">
                <button onClick={toggleSidebar} className="p-2.5 hover:bg-muted rounded-xl transition-all active:scale-95 lg:hidden">
                    <Menu className="h-5 w-5 text-foreground" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Management Suite</span>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                        className={cn(
                            "relative p-2.5 hover:bg-muted rounded-xl transition-all active:scale-95",
                            notifOpen && "bg-muted shadow-inner"
                        )}
                    >
                        <Bell className="h-5 w-5 text-foreground/70" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute top-full right-0 mt-3 w-96 bg-card border border-border/50 rounded-2xl shadow-xl z-50 animate-fade-in glass">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 text-card-foreground">
                                <h3 className="font-bold text-foreground text-sm tracking-tight">Activity Feed</h3>
                                {unreadCount > 0 && (
                                    <button onClick={() => markAllRead.mutate()}
                                        className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto scrollbar-premium p-2">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-muted-foreground/60 text-sm font-medium italic">All caught up!</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className={cn('p-3 rounded-xl transition-colors mb-1', !n.isRead ? 'bg-primary/5' : 'hover:bg-muted/50')}>
                                            <div className="flex gap-3">
                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", !n.isRead ? "bg-primary" : "bg-transparent")} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-foreground/90 leading-tight">{n.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-border/50">
                                <button onClick={() => { router.push('/notifications'); setNotifOpen(false); }}
                                    className="w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-all">
                                    Open Notification Center
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Account */}
                {user && (
                    <div className="relative ml-2">
                        <button
                            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                            className="flex items-center gap-3 p-1 pl-3 pr-2 bg-muted/30 border border-border/30 rounded-full hover:bg-muted/60 transition-all active:scale-[0.98]"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-foreground leading-none">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-1">{user.role}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shadow-sm">
                                <span className="text-white text-[10px] font-bold">{getInitials(user.firstName, user.lastName)}</span>
                            </div>
                        </button>

                        {userMenuOpen && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-card border border-border/50 rounded-2xl shadow-xl z-50 p-2 animate-fade-in glass">
                                <div className="px-3 py-2 mb-2">
                                    <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Account</p>
                                </div>
                                <button onClick={() => { router.push('/settings'); setUserMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-muted hover:text-foreground rounded-xl transition-all">
                                    Profile Settings
                                </button>
                                <div className="my-2 h-px bg-border/50" />
                                <button onClick={handleLogout}
                                    className="w-full text-left px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop for menus */}
            {(userMenuOpen || notifOpen) && (
                <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px]" onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }} />
            )}
        </header>
    );
}
