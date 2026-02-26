'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import {
    ShieldCheck as RolesIcon,
    Search,
    Plus,
    MoreVertical,
    Trash2,
    Settings,
    Loader2,
    Lock,
    Unlock,
    CheckCircle2,
    Circle,
    UserCircle2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function RolesAdminPage() {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const isSuperAdmin = currentUser?.role === 'super_admin' || (currentUser as any)?.userType === 'super_admin';
    const { data: roles, isLoading } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminApi.listRoles(),
        enabled: isSuperAdmin,
        select: r => r.data,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            toast.success('Role deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete role');
        }
    });

    if (!isSuperAdmin) return null;

    const filteredRoles = roles?.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.slug.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <RolesIcon className="h-5 w-5" /> Authority Framework
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Platform Roles</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Define system-wide access levels and default role mappings.</p>
                </div>
                <Link href="/admin/roles/new">
                    <Button variant="gradient" className="rounded-2xl h-14 px-8 font-bold uppercase tracking-[0.15em] text-[11px] hover:-translate-y-1 active:translate-y-0 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Initialize Role
                    </Button>
                </Link>
            </div>

            {/* Quick Stats & Search */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
                    <Input
                        placeholder="Search roles by name or key..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 bg-card border border-border/40"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{roles?.length ?? 0} Global Definitions</span>
                    </div>
                    <div className="w-px h-6 bg-border/40" />
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                        <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{roles?.filter(r => r.isDefault).length ?? 0} Default Mappings</span>
                    </div>
                </div>
            </div>

            {/* Roles Table */}
            <div className="glass rounded-[2rem] border-none shadow-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Querying Access Policies...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-10">Designation</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Default For</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead className="text-right px-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredRoles.map((role, idx) => (
                                    <motion.tr
                                        key={role.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                        className="border-b border-border/40 transition-colors hover:bg-muted/50 group"
                                    >
                                        <TableCell className="px-10 py-6">
                                            <Link href={`/admin/roles/${role.id}`} className="group/role">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground group-hover/role:text-primary transition-colors flex items-center gap-2">
                                                        {role.name}
                                                        {role.isSystem && (
                                                            <span title="System Locked">
                                                                <Lock className="h-3 w-3 text-muted-foreground/40" />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-medium italic">{role.slug}</span>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <Badge variant={role.isSystem ? 'system' : 'outline'} className={cn(
                                                "rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                                                !role.isSystem && "border-border/60 text-muted-foreground bg-card/40"
                                            )}>
                                                {role.isSystem ? 'System Core' : 'Custom Definition'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            {role.isDefault ? (
                                                <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-wider">
                                                    <UserCircle2 className="h-3.5 w-3.5" />
                                                    {role.targetUserType || 'N/A'}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", role.orgId ? "bg-accent" : "bg-primary")} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {role.orgId ? 'Tenant Local' : 'Global Platform'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-10 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/40">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">Authority Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/roles/${role.id}`} className="flex items-center gap-2 cursor-pointer rounded-xl">
                                                            <Settings className="h-4 w-4" /> Configure Permissions
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!role.isSystem && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this role? This might affect organizations using cloned versions.')) {
                                                                    deleteMutation.mutate(role.id);
                                                                }
                                                            }}
                                                            disabled={deleteMutation.isPending}
                                                            className="flex items-center gap-2 cursor-pointer rounded-xl text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Decommission Role
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredRoles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/40">
                                                <RolesIcon className="h-6 w-6" />
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">No access policies found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
