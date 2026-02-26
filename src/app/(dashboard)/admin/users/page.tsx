'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import {
    Users as UsersIcon,
    Search,
    Filter,
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function UsersAdminPage() {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;

    const isSuperAdmin = currentUser?.role === 'super_admin' || (currentUser as any)?.userType === 'super_admin';
    const { data: usersRes, isLoading } = useQuery({
        queryKey: ['admin-users', page, search],
        queryFn: () => adminApi.listUsers({ page, limit, search }),
        enabled: isSuperAdmin,
        select: r => r.data,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminApi.toggleUserStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User status updated');
        },
        onError: () => {
            toast.error('Failed to update user status');
        }
    });

    if (currentUser?.role !== 'super_admin') return null;

    const users = usersRes?.items ?? [];
    const totalPages = usersRes?.meta?.totalPages ?? 1;

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <UsersIcon className="h-5 w-5" /> Identity Governance
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">User Management</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Control platform-wide access and account permissions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-12 bg-card border border-border/40"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-border/40 h-11 px-6 font-bold uppercase tracking-wider text-[10px]">
                        <Filter className="mr-2 h-3.5 w-3.5" /> All Roles
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass rounded-[2rem] border-none shadow-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Identity Records...</p>
                    </div>
                ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-10">Personnel</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right px-10">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {users.map((user, idx) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            className="border-b border-border/40 transition-colors hover:bg-muted/50 group"
                                        >
                                            <TableCell className="px-10 py-6">
                                            <Link href={`/admin/users/${user.id}`} className="flex items-center gap-4 group/user">
                                                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-primary-foreground text-xs font-bold uppercase shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover/user:scale-110">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate group-hover/user:text-primary transition-colors">
                                                        {user.firstName} {user.lastName}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-medium truncate">{user.email}</span>
                                                </div>
                                            </Link>
                                            </TableCell>
                                            <TableCell className="px-6 py-6">
                                                <Badge variant={user.role === 'super_admin' ? 'system' : 'outline'} className={cn(
                                                "rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                                                    user.role !== 'super_admin' && "border-border/60 text-muted-foreground bg-card/40"
                                            )}>
                                                {user.role}
                                            </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]" : "bg-muted-foreground/30")} />
                                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", user.isActive ? "text-success" : "text-muted-foreground/60")}>
                                                    {user.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-6 font-mono text-[10px] font-medium text-muted-foreground/60 tracking-tighter">
                                            {formatDate(user.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-10 py-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/40">
                                                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">Personnel Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 cursor-pointer rounded-xl">
                                                                <UserCheck className="h-4 w-4" /> View Full Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => toggleStatusMutation.mutate({ id: user.id, isActive: !user.isActive })}
                                                            disabled={user.id === currentUser.id || toggleStatusMutation.isPending}
                                                            className={cn(
                                                                "flex items-center gap-2 cursor-pointer rounded-xl",
                                                                user.isActive ? "text-destructive focus:text-destructive" : "text-success focus:text-success"
                                                            )}
                                                        >
                                                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                            {user.isActive ? 'Suspend Account' : 'Restore Account'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                )}

                {/* Pagination */}
                <div className="px-10 py-6 border-t border-border/40 bg-card/40 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        Page {page} of {totalPages}
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
