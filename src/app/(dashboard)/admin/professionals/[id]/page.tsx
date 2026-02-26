'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { useAuthStore } from '@/store/auth.store';
import { useParams, useRouter } from 'next/navigation';
import { 
    Scale, 
    ArrowLeft, 
    Award, 
    Briefcase, 
    User, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Loader2,
    Database,
    ShieldCheck,
    Hash,
    MapPin,
    Building,
    FileText
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProfessionalDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    const { data: proRes, isLoading } = useQuery({
        queryKey: ['admin-professional', id],
        queryFn: () => adminApi.getProfessional(id as string),
        enabled: !!id && !!currentUser && currentUser.role === 'super_admin',
        select: r => r.data,
    });

    const verifyMutation = useMutation({
        mutationFn: () => adminApi.verifyProfessional(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-professional', id] });
            toast.success('Professional credentials verified');
        },
        onError: () => {
            toast.error('Verification failed');
        }
    });

    if (currentUser?.role !== 'super_admin') return null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Analyzing Credential Matrices...</p>
            </div>
        );
    }

    const pro = proRes;
    if (!pro) {
        return (
            <div className="centered-container py-24 text-center space-y-4">
                <Database className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-foreground font-bold font-display italic">Professional profile not found in verification registry.</p>
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
                        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Professional Adjudication</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">RE-ID: {pro.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!pro.isVerified ? (
                        <>
                            <Button 
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 shadow-xl shadow-primary/20"
                                onClick={() => verifyMutation.mutate()}
                                disabled={verifyMutation.isPending}
                            >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Authorize Professional
                            </Button>
                            <Button 
                                variant="destructive" 
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 shadow-xl shadow-destructive/20"
                                onClick={() => toast.error('Rejection protocol pending implementation')}
                            >
                                <XCircle className="mr-2 h-3.5 w-3.5" /> Deny Credentials
                            </Button>
                        </>
                    ) : (
                            <Badge variant="success" className="border-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Verified Practitioner
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Professional Identity */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/60 overflow-hidden p-10 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-[2rem] brand-gradient flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-primary/20 ring-4 ring-background/50">
                                {pro.user?.firstName[0]}{pro.user?.lastName[0]}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground leading-tight">{pro.user?.firstName} {pro.user?.lastName}</h2>
                                <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold border-primary/50 text-primary bg-primary/5 uppercase tracking-widest">
                                    {pro.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 py-2">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground/40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                    {pro.licenseNumber || 'LICENSE PENDING'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-xl bg-card/40 p-6 space-y-4">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> Base of Operations
                        </h3>
                        <div className="space-y-2 pt-2">
                            <p className="text-sm font-bold text-foreground">{pro.city}, {pro.state}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pro.country}</p>
                        </div>
                    </Card>
                </div>

                {/* Right: Qualifications & Expertise */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass rounded-[2rem] p-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Briefcase className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Experience Legacy</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground font-mono">{pro.experienceYears || 0} <span className="text-sm font-sans uppercase">Years</span></p>
                        </div>
                        <div className="glass rounded-[2rem] p-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Award className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Specialist Rating</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground font-mono">ADVOCATE</p>
                        </div>
                    </div>

                    <div className="glass rounded-[2.5rem] p-10 space-y-10">
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                                <Scale className="h-5 w-5 text-primary" /> Legal Intelligence Profile
                            </h3>
                            
                            <div className="space-y-4">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Specializations Matrix</p>
                                <div className="flex flex-wrap gap-2">
                                    {(pro.specializations || []).map(s => (
                                        <Badge key={s} className="rounded-xl px-4 py-2 text-[10px] font-bold bg-muted/40 text-foreground border border-border/40 uppercase tracking-widest">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Professional Proviso</p>
                                <div className="p-6 rounded-3xl bg-muted/20 border border-border/20">
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        {pro.bio || 'Detailed professional bio has not been documented.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-border/40">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Verification Metadata</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-xs">
                                    <FileText className="h-4 w-4 text-primary/40" />
                                    <span className="text-muted-foreground">Bar Council Affiliation:</span>
                                    <span className="text-foreground font-bold uppercase">{pro.state} Bar Association</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <Calendar className="h-4 w-4 text-primary/40" />
                                    <span className="text-muted-foreground">Registry Entry:</span>
                                    <span className="text-foreground font-bold font-mono">SYSTEM_RECORD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
