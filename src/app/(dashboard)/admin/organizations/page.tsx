'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import {
    Building2,
    Search,
    Filter,
    MoreVertical,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Globe,
    Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OrganizationsAdminPage() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;

    const { data: orgsRes, isLoading } = useQuery({
        queryKey: ['admin-orgs', page, search],
        queryFn: () => adminApi.listOrgs({ page, limit, search }),
        enabled: !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    if (currentUser?.role !== 'super_admin') return null;

    const orgs = orgsRes?.items ?? [];
    const totalPages = orgsRes?.totalPages ?? 1;

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <Building2 className="h-4 w-4" /> Structural Oversight
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Organization Registry</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Monitor and manage all corporate entities and legal structures.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by organization name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-border/40 h-11 px-6 font-bold uppercase tracking-wider text-[10px]">
                        <Filter className="mr-2 h-3.5 w-3.5" /> All Types
                    </Button>
                    <Button onClick={() => router.push('/admin/organizations/new')} className="rounded-xl h-11 px-6 font-bold uppercase tracking-wider text-[10px] shadow-xl shadow-primary/20">
                        <Building2 className="mr-2 h-3.5 w-3.5" /> Initialize Entity
                    </Button>
                </div>
            </div>

            {/* Organizations Table */}
            <div className="glass rounded-[2rem] border-none shadow-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Retrieving Entity Records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="text-left px-10 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Entity</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Type</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Location</th>
                                    <th className="text-left px-6 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Registration</th>
                                    <th className="text-right px-10 py-5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {orgs.map((org) => (
                                    <tr key={org.id} className="hover:bg-muted/50 group transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <Link href={`/admin/organizations/${org.id}`} className="flex items-center gap-4 group/org">
                                                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white text-xs font-bold uppercase shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover/org:scale-110">
                                                    {org.name[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate group-hover/org:text-primary transition-colors">
                                                        {org.name}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1">
                                                        <Globe className="h-3 w-3" /> {org.website || 'No website'}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-bold border-border/60 bg-card/40 text-muted-foreground uppercase tracking-widest">
                                                {org.type || 'CORPORATE'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                                                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                                                <span>{org.country || 'Global'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-[10px] font-medium text-muted-foreground/60 tracking-tighter flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" /> {formatDate(org.createdAt)}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
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
                        Index {page} of {totalPages}
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
