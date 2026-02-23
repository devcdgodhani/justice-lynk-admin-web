'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, Loader2, BellRing, Inbox, CheckCircle2 } from 'lucide-react';
import { notificationsApi } from '@/services/notifications.api';
import { cn, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationsPage() {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsApi.getNotifications(1, 50),
        select: (r) => r.data,
    });

    const markAll = useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications-unread'] });
            toast.success('All marked as read');
        },
    });

    const clearAll = useMutation({
        mutationFn: notificationsApi.clearAll,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications-unread'] });
            toast.success('Notifications cleared');
        },
    });

    const markOne = useMutation({
        mutationFn: (id: string) => notificationsApi.markRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications-unread'] });
        },
    });

    const items = data?.items ?? [];
    const unreadCount = items.filter(n => !n.isRead).length;

    return (
        <div className="centered-container py-12 max-w-3xl animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Signal Registry
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Notifications</h1>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 ? (
                            <Badge variant="premium" className="rounded-md px-2 py-0 text-[9px] font-black tracking-widest">
                                {unreadCount} UNREAD ALERTS
                            </Badge>
                        ) : (
                            <p className="text-muted-foreground font-medium text-sm italic">System integrity nominal. All signals processed.</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    {unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => markAll.mutate()}
                            disabled={markAll.isPending}
                            className="rounded-xl font-bold uppercase tracking-widest text-[9px] h-10 px-4"
                        >
                            <Check className="mr-2 h-3 w-3" /> Mark All Read
                        </Button>
                    )}
                    {items.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearAll.mutate()}
                            disabled={clearAll.isPending}
                            className="rounded-xl font-bold uppercase tracking-widest text-[9px] h-10 px-4 text-destructive hover:text-destructive hover:bg-destructive/5"
                        >
                            <Trash2 className="mr-2 h-3 w-3" /> Clear Archive
                        </Button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="glass rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Polling Satellite Streams...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-32 text-center space-y-6 bg-card/40">
                        <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto shadow-inner">
                            <Inbox className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold font-display text-foreground">Static Silence</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto italic font-medium">No new signals have been registered in your protocol.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {items.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    'group flex items-start gap-5 px-8 py-6 transition-all duration-300',
                                    !n.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-card/40 border-l-4 border-l-transparent hover:bg-card/60'
                                )}
                            >
                                <div className="mt-1 flex-shrink-0 relative">
                                    <div className={cn(
                                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500',
                                        !n.isRead ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted/30 text-muted-foreground/40'
                                    )}>
                                        <BellRing className="h-5 w-5" />
                                    </div>
                                    {!n.isRead && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success border-2 border-background rounded-full scale-110" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className={cn(
                                            'font-bold text-sm font-display tracking-tight transition-colors',
                                            !n.isRead ? 'text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">
                                            {formatDateTime(n.createdAt)}
                                        </span>
                                    </div>
                                    {n.body && (
                                        <p className={cn(
                                            'text-sm leading-relaxed max-w-2xl',
                                            !n.isRead ? 'text-foreground/70 font-medium' : 'text-muted-foreground/60 italic font-normal'
                                        )}>
                                            {n.body}
                                        </p>
                                    )}
                                    {!n.isRead && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => markOne.mutate(n.id)}
                                                className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:opacity-70 transition-all"
                                            >
                                                <CheckCircle2 className="h-3 w-3" /> Acknowledge Signal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Platform Integrity Note */}
            <div className="flex items-center justify-center gap-4 text-muted-foreground/30 py-8 border-t border-border/40">
                <span className="h-px w-12 bg-border/40" />
                <p className="text-[8px] font-bold uppercase tracking-[0.3em]">End of Transmission</p>
                <span className="h-px w-12 bg-border/40" />
            </div>
        </div>
    );
}
