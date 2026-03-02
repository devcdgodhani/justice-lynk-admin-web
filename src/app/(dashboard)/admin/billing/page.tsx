'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import { 
    CreditCard, 
    TrendingUp, 
    Calendar,
    Loader2, 
    Database,
    ArrowUpRight,
    Search,
    Download
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BillingAdminPage() {
    const { user: currentUser } = useAuthStore();
    const [year, setYear] = useState(new Date().getFullYear());

    const { data: revenueRes, isLoading } = useQuery({
        queryKey: ['admin-revenue', year],
        queryFn: () => adminApi.getRevenue(year),
        enabled: !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    if (currentUser?.role !== 'super_admin') return null;

    const monthlyRevenue = revenueRes?.monthly ?? [];
    const totalRevenue = revenueRes?.total ?? 0;
    const currency = revenueRes?.currency ?? 'INR';

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <CreditCard className="h-5 w-5" /> Fiscal Oversight
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Revenue Analytics</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Monitor global throughput and subscription health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 border-border/40">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-none shadow-xl bg-card/60 p-8 overflow-hidden relative group">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-success/10">
                                <TrendingUp className="h-4 w-4 text-success" />
                            </div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Global Revenue</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-bold text-foreground font-mono tracking-tighter">
                                {isLoading ? '...' : `${currency} ${totalRevenue.toLocaleString()}`}
                            </h3>
                            <p className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1">
                                +14.2% Growth <ArrowUpRight className="h-3 w-3" />
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Monthly Breakdown */}
            <div className="glass rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-card/40">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-3">
                            <Calendar className="h-6 w-6" /> Monthly Throughput
                        </h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Current Fiscal Year Breakdown</p>
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Reconciling Ledgers...</p>
                    </div>
                ) : monthlyRevenue.length === 0 ? (
                    <div className="py-24 text-center space-y-4 bg-card/40">
                        <Database className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-foreground font-bold font-display italic">No revenue sequences recorded for this period.</p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {monthlyRevenue?.map((m) => (
                                <div key={m.month} className="p-6 rounded-3xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-all group">
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{m.month}</p>
                                    <p className="text-lg font-bold text-foreground font-mono group-hover:text-primary transition-colors">
                                        {m.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
