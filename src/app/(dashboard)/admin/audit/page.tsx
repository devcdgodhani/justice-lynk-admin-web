'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/audit.api';
import { useAuthStore } from '@/store/auth.store';
import {
    Fingerprint as AuditIcon,
    Search,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Activity,
    User,
    Shield,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';

export default function AuditPage() {
    const { user: currentUser } = useAuthStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [module, setModule] = useState('');
    const limit = 15;

    const isSuperAdmin = currentUser?.role === 'super_admin' || (currentUser as any)?.userType === 'super_admin';
    const { data: logsRes, isLoading } = useQuery({
        queryKey: ['admin-audit', page, module, search],
        queryFn: () => auditApi.getAuditLogs({ page, limit, module, search }),
        enabled: isSuperAdmin,
        select: r => r.data,
    });

    if (!isSuperAdmin) return null;

    const logs = logsRes?.items ?? [];
    const totalPages = logsRes?.meta?.totalPages ?? 1;

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <AuditIcon className="h-5 w-5" /> Sovereign Traceability
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Audit Explorer</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Comprehensive immutable ledger of all high-privilege platform actions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
                        <Input
                            placeholder="Filter by actor or protocol..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-12 bg-card border border-border/40"
                        />
                    </div>
                    <Select
                        value={module}
                        onValueChange={(val) => {
                            setModule(val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="h-12 w-auto min-w-[200px] bg-card border-border/40">
                            <SelectValue placeholder="All Subsystems" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null-filter">All Subsystems</SelectItem>
                            <SelectItem value="auth">Authentication</SelectItem>
                            <SelectItem value="roles">Authority</SelectItem>
                            <SelectItem value="orgs">Organizations</SelectItem>
                            <SelectItem value="users">Personnel</SelectItem>
                            <SelectItem value="cases">Vault/Records</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-border/40 h-11 px-6 font-bold uppercase tracking-wider text-[10px]">
                        <Calendar className="mr-2 h-3.5 w-3.5" /> Date Range
                    </Button>
                </div>
            </div>

            {/* Audit Table */}
            <div className="glass rounded-[2rem] border-none shadow-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Synchronizing Ledger Streams...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-10">Personnel</TableHead>
                                <TableHead>Protocol</TableHead>
                                <TableHead>Subsystem</TableHead>
                                <TableHead>Target Entity</TableHead>
                                <TableHead className="text-right px-10">Sequence Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="group">
                                    <TableCell className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center text-primary-foreground text-[10px] font-bold uppercase shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                                                {log.user?.firstName?.[0] || log.user?.email?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {log.user?.firstName ? `${log.user.firstName} ${log.user.lastName}` : (log.user?.email || 'System')}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/50 font-mono tracking-tighter italic">
                                                    {log.appType}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <Badge variant="system" className="px-3 py-1">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-bold border-border/60 bg-card/40 text-muted-foreground uppercase tracking-widest">
                                            {log.module}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-6 font-mono text-[9px] text-primary/60 tracking-tighter">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-primary/40">{log.entityType}:</span>
                                            <span>{log.entityId?.slice(0, 8) || 'GLOBAL'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-6 text-right whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-muted-foreground/60 tracking-tighter">
                                            {formatDateTime(log.createdAt)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Pagination */}
                <div className="px-10 py-6 border-t border-border/40 bg-card/40 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        Sequence {page} of {totalPages}
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
