'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import { useParams, useRouter } from 'next/navigation';
import { 
    Users, 
    ArrowLeft, 
    Shield, 
    Mail, 
    Phone, 
    Calendar, 
    Activity, 
    UserX, 
    UserCheck,
    CheckCircle2,
    XCircle,
    Loader2,
    Database,
    Fingerprint,
    Trash2
} from 'lucide-react';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    const { data: userRes, isLoading } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => adminApi.getUser(id as string),
        enabled: !!id && !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (isActive: boolean) => 
            adminApi.toggleUserStatus(id as string, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
            toast.success('User status updated');
        },
        onError: () => {
            toast.error('Failed to update user status');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteUser(id as string),
        onSuccess: () => {
            toast.success('User deleted from registry');
            router.push('/admin/users');
        },
        onError: () => {
            toast.error('Deletion failed');
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ status, note }: { status: 'approved' | 'rejected' | 'pending' | 'suspended'; note?: string }) =>
            adminApi.updateApprovalStatus(id as string, status, note),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
            toast.success(res.message || 'Status updated');
        },
        onError: () => {
            toast.error('Failed to update approval status');
        }
    });

    if (currentUser?.role !== 'super_admin') return null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Decrypting Identity Record...</p>
            </div>
        );
    }

    const user = userRes;
    if (!user) {
        return (
            <div className="centered-container py-24 text-center space-y-4">
                <Database className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-foreground font-bold font-display italic">Identity record not found in sovereign database.</p>
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-border/40">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="centered-container py-12 max-w-5xl animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl hover:bg-muted">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Personnel Dossier</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">ID: {user.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className={cn(
                            "rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 border-border/40 transition-all",
                            user.isActive ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"
                        )}
                        onClick={() => toggleStatusMutation.mutate(!user.isActive)}
                        disabled={toggleStatusMutation.isPending || user.id === currentUser.id}
                    >
                        {user.isActive ? <><UserX className="mr-2 h-3.5 w-3.5" /> Suspend</> : <><UserCheck className="mr-2 h-3.5 w-3.5" /> Activate</>}
                    </Button>
                    {user.approvalStatus === 'pending' && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="gradient"
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11"
                                onClick={() => statusMutation.mutate({ status: 'approved' })}
                                disabled={statusMutation.isPending}
                            >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 text-destructive border-destructive/20 hover:bg-destructive/10"
                                onClick={() => {
                                    const note = prompt('Reason for rejection:');
                                    if (note !== null) statusMutation.mutate({ status: 'rejected', note });
                                }}
                                disabled={statusMutation.isPending}
                            >
                                <XCircle className="mr-2 h-3.5 w-3.5" /> Reject
                            </Button>
                        </div>
                    )}
                    <Button 
                        variant="destructive" 
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 shadow-xl shadow-destructive/20"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending || user.id === currentUser.id}
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Purge
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/60 overflow-hidden text-center p-10">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-[2rem] brand-gradient flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-primary/20 ring-4 ring-background/50">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                                <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold border-primary/50 text-primary bg-primary/5 uppercase tracking-widest">
                                    {user.role}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 py-2">
                                <Activity className={cn("h-3.5 w-3.5", user.isActive ? "text-success" : "text-muted-foreground/30")} />
                                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", user.isActive ? "text-success" : "text-muted-foreground/40")}>
                                    {user.isActive ? 'Status: Active' : 'Status: Restricted'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Application Status</p>
                                <Badge
                                    className={cn(
                                        "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                                        user.approvalStatus === 'approved' ? "bg-success/10 text-success" :
                                            user.approvalStatus === 'pending' ? "bg-warning/10 text-warning" :
                                                user.approvalStatus === 'rejected' ? "bg-destructive/10 text-destructive" :
                                                    "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {user.approvalStatus || 'None'}
                                </Badge>
                                {user.approvalNote && (
                                    <p className="text-[10px] text-destructive italic mt-1 max-w-[200px] break-words">
                                        &quot;{user.approvalNote}&quot;
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-xl bg-card/40 p-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Fingerprint className="h-3.5 w-3.5 text-primary" /> Forensic Data
                            </h3>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Joined Platform</span>
                                    <span className="text-foreground font-bold font-mono">{formatDate(user.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Last Sequence</span>
                                    <span className="text-foreground font-bold font-mono">{formatDateTime(user.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Contact & Security Profile */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass rounded-[2.5rem] p-10 space-y-10">
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary" /> Credentials & Communication
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 p-6 rounded-3xl bg-muted/30 border border-border/40 group hover:bg-muted/50 transition-all">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> Communication Vector
                                    </p>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.email}</p>
                                </div>
                                <div className="space-y-2 p-6 rounded-3xl bg-muted/30 border border-border/40 group hover:bg-muted/50 transition-all">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Tethered Protocol
                                    </p>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-border/40 pb-4">
                                System Permissions Registry
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user.role === 'super_admin' ? (
                                    <Badge className="rounded-xl px-4 py-2 text-[10px] font-bold bg-primary text-white uppercase tracking-widest">Global Administrative Override</Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-xl px-4 py-2 text-[10px] font-bold border-border/40 text-muted-foreground uppercase tracking-widest">Standard User Context</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
