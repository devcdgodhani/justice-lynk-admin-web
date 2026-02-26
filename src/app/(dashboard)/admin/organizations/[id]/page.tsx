'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import { useParams, useRouter } from 'next/navigation';
import { 
    Building2, 
    ArrowLeft, 
    Globe, 
    Mail, 
    MapPin, 
    Calendar, 
    Users, 
    Briefcase, 
    CreditCard,
    Loader2,
    Database,
    ShieldCheck,
    Pencil,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OrganizationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    const { data: orgRes, isLoading } = useQuery({
        queryKey: ['admin-org', id],
        queryFn: () => adminApi.getOrg(id as string),
        enabled: !!id && !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteOrg(id as string),
        onSuccess: () => {
            toast.success('Organization purged from registry');
            router.push('/admin/organizations');
        },
        onError: () => {
            toast.error('Deletion failed');
        }
    });

    if (currentUser?.role !== 'super_admin') return null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Retrieving Structural Data...</p>
            </div>
        );
    }

    const org = orgRes;
    if (!org) {
        return (
            <div className="centered-container py-24 text-center space-y-4">
                <Database className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-foreground font-bold font-display italic">Entity record not found in structural registry.</p>
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-border/40">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    // Cast org as any to access counts and subscription which are included in admin list but might not be in base type
    const orgData = org as any;

    return (
        <div className="centered-container py-12 max-w-5xl animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl hover:bg-muted">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Entity Dossier</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">ORG-ID: {org.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 border-border/40"
                        onClick={() => toast.info('Edit functionality implementation pending')}
                    >
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Registry
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 shadow-xl shadow-destructive/20"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Decommission
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Entity Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/60 overflow-hidden p-10 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-[2rem] brand-gradient flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-primary/20 ring-4 ring-background/50">
                                {org.name[0]}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground leading-tight">{org.name}</h2>
                                <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold border-border/60 text-muted-foreground bg-card/40 uppercase tracking-widest">
                                    {org.type || 'CORPORATE ENTITY'}
                                </Badge>
                            </div>
                            {org.website && (
                                <a 
                                    href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                                >
                                    <Globe className="h-3 w-3" /> Visit Domain <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-xl bg-card/40 p-6 space-y-4">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Subscription Status
                        </h3>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Plan</span>
                                <Badge variant="success" className="border-none text-[9px] font-black uppercase">Active</Badge>
                            </div>
                            <p className="text-lg font-bold text-foreground font-display">
                                {orgData.subscription?.plan?.name || 'FREE TIER'}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right: Operational Data */}
                <div className="lg:col-span-2 space-y-8">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass rounded-[2rem] p-6 text-center space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground font-mono">{orgData._count?.members || 0}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Personnel</p>
                        </div>
                        <div className="glass rounded-[2rem] p-6 text-center space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground font-mono">{orgData._count?.cases || 0}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Cases</p>
                        </div>
                        <div className="glass rounded-[2rem] p-6 text-center space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground font-mono">
                                {orgData.subscription?.plan?.price ? `${orgData.subscription.plan.currency} ${orgData.subscription.plan.price}` : 'N/A'}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue</p>
                        </div>
                    </div>

                    <div className="glass rounded-[2.5rem] p-10 space-y-10">
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                                <Database className="h-5 w-5 text-primary" /> Structural Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 p-6 rounded-3xl bg-muted/30 border border-border/40">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Regional Context
                                    </p>
                                    <p className="text-sm font-bold text-foreground">{org.country || 'Global Jurisdiction'}</p>
                                </div>
                                <div className="space-y-2 p-6 rounded-3xl bg-muted/30 border border-border/40">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Registration Protocol
                                    </p>
                                    <p className="text-sm font-bold text-foreground font-mono">{formatDate(org.createdAt)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Executive Description</p>
                                <div className="p-6 rounded-3xl bg-muted/20 border border-border/20">
                                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                                        {org.description || 'No formal description documented in sovereign registry.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/40">
                            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-mono">
                                <span>Record Sequence: {formatDateTime(org.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
