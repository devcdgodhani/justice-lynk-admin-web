'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import {
    Scale,
    Search,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Award,
    Hash,
    ShieldCheck
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProfessionalsAdminPage() {
    const { user: currentUser } = useAuthStore();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: professionalsRes, isLoading } = useQuery({
        queryKey: ['admin-professionals-pending', page],
        queryFn: () => adminApi.getPendingVerifications(page, limit),
        enabled: !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    if (currentUser?.role !== 'super_admin') return null;

    const professionals = professionalsRes?.items ?? [];
    const totalPages = professionalsRes?.totalPages ?? 1;

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <ShieldCheck className="h-4 w-4" /> Credentials Verification
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Professional Adjudication</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Verify and authorize legal professionals on the platform.</p>
                </div>
            </div>

            {/* Professionals Table */}
            <div className="glass rounded-[2rem] border-none shadow-2xl overflow-hidden">
                <div className="px-10 py-6 border-b border-border/40 bg-card/40 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                        <Award className="h-4 w-4 text-primary" /> Pending Critical Review
                    </h2>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Analyzing Credential Vectors...</p>
                    </div>
                ) : professionals.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <ShieldCheck className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-foreground font-bold font-display italic">All professional credentials verified.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="text-left px-10 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Professional</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">License</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Expertise</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                    <th className="text-right px-10 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {professionals.map((pro) => (
                                    <tr key={pro.id} className="hover:bg-muted/50 group transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <Link href={`/admin/professionals/${pro.id}`} className="flex items-center gap-4 group/pro">
                                                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-primary-foreground text-xs font-bold uppercase shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover/pro:scale-110">
                                                    {pro.user?.firstName[0]}{pro.user?.lastName[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate group-hover/pro:text-primary transition-colors">
                                                        {pro.user?.firstName} {pro.user?.lastName}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
                                                        {pro.type} • {pro.experienceYears || 0} Years Exp
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px] font-bold">
                                                <Hash className="h-3.5 w-3.5 text-primary/60" />
                                                <span>{pro.licenseNumber || 'PENDING'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {(pro.specializations || []).slice(0, 2).map(s => (
                                                    <Badge key={s} variant="info" className="rounded-lg px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest leading-none">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="warning" className="rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                                Awaiting Verify
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-success hover:bg-success/10 transition-all shadow-sm">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-all shadow-sm">
                                                    <XCircle className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-10 py-6 border-t border-border/40 bg-card/40 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Protocol {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => p - 1)}
                            className="h-8 w-8 rounded-lg border-border/40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === totalPages || isLoading}
                            onClick={() => setPage(p => p + 1)}
                            className="h-8 w-8 rounded-lg border-border/40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
