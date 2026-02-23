'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { auditApi } from '@/services/audit.api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users, Building2, Briefcase, TrendingUp, Loader2, ShieldAlert, Activity, Fingerprint, Database, Globe } from 'lucide-react';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user && user.role !== 'super_admin') {
            router.replace('/dashboard');
        }
    }, [user, router]);

    const { data: statsRes, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminApi.getStats,
        enabled: user?.role === 'super_admin',
        select: r => r.data,
    });

    const { data: logsRes, isLoading: logsLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => auditApi.getAuditLogs({ page: 1, limit: 20 }),
        enabled: user?.role === 'super_admin',
        select: r => r.data,
    });

    if (user?.role !== 'super_admin') return null;

    const stats = statsRes;
    const logs = logsRes?.items ?? [];

    const statCards = [
        { label: 'GLOBAL PERSONNEL', value: stats?.totalUsers ?? '0', icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
        { label: 'REGISTERED ORGS', value: stats?.totalOrgs ?? '0', icon: Building2, color: 'text-primary', bg: 'bg-primary/10', trend: '+5' },
        { label: 'VAULTED RECORDS', value: stats?.totalCases ?? '0', icon: Briefcase, color: 'text-secondary', bg: 'bg-secondary/10', trend: 'ACTIVE' },
        { label: 'REVENUE THROUGHPUT', value: stats?.activeSubs ?? '0', icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10', trend: 'STABLE' },
    ];

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <ShieldAlert className="h-4 w-4" /> System Oversight
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Admin Console</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Platform-wide adjudication and organizational governance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 border-border/40">
                        <Database className="mr-2 h-3.5 w-3.5" /> Database
                    </Button>
                    <Button className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-primary/20">
                        <Globe className="mr-2 h-3.5 w-3.5" /> Global Sync
                    </Button>
                </div>
            </div>

            {/* High-Impact KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 glass animate-pulse rounded-[2rem]" />
                    ))
                ) : (
                    statCards.map(s => (
                        <Card key={s.label} className="group rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card/60 overflow-hidden">
                            <CardContent className="p-7">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-2 rounded-lg", s.bg)}>
                                                <s.icon className={cn("h-4 w-4", s.color)} />
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-3xl font-bold text-foreground font-mono tracking-tighter">{s.value}</p>
                                            <Badge variant="secondary" className="bg-transparent border-none text-[8px] font-black text-emerald-500 p-0 tracking-tighter">
                                                {s.trend} ↑
                                            </Badge>
                                        </div>
                                    </div>
                                    <Activity className="h-10 w-10 text-muted-foreground/5 opacity-20 -mr-2 -mt-2 group-hover:text-primary/20 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Sovereign Audit Registry */}
            <div className="glass rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-card/40">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-3">
                            <Fingerprint className="h-5 w-5 text-primary" /> Audit Registry
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">REAL-TIME GLOBAL TRACEABILITY</p>
                    </div>
                </div>
                {logsLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Decrypting Audit Streams...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-24 text-center space-y-4 bg-card/40">
                        <Database className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-foreground font-bold font-display italic">No audit sequences detected.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="text-left px-10 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Subsystem</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Protocol</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/50 group transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                                                    {log.user?.email?.[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {log.user?.email || log.userId}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/50 font-mono">UID: {log.userId?.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-bold border-border/60 bg-card/40 text-muted-foreground uppercase tracking-widest">
                                                {log.module}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1 rounded-lg text-[9px] font-bold bg-primary/5 text-primary uppercase tracking-widest border border-primary/10 shadow-sm shadow-primary/5">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-tighter">
                                                {formatDateTime(log.createdAt)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
