'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Shield, Phone, Mail, Fingerprint, History, LogOut, CheckCircle2, Monitor, Smartphone, Globe } from 'lucide-react';
import { usersApi } from '@/services/users.api';
import { securityApi } from '@/services/security.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { cn, getErrorMessage } from '@/lib/utils';
import { jwtDecode } from 'jwt-decode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MfaSetupDialog } from '@/components/auth/mfa-setup-dialog';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const inputCls = 'w-full px-6 py-4 bg-muted/40 border border-border/60 rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all duration-300';
const labelCls = 'block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1';

export default function SettingsPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const { user: storeUser, setAuth, clearAuth, accessToken, refreshToken } = useAuthStore();
    const [setupOpen, setSetupOpen] = React.useState(false);
    const [disableOpen, setDisableOpen] = React.useState(false);
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const { data: profileRes, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: usersApi.getProfile,
        select: r => r.data,
    });

    const { data: mfa } = useQuery({
        queryKey: ['mfa-status'],
        queryFn: securityApi.getMfaStatus,
        select: r => r.data,
    });

    const { data: sessionsRes } = useQuery({
        queryKey: ['sessions'],
        queryFn: securityApi.getSessions,
        select: r => r.data ?? [],
    });

    const profile = profileRes ?? storeUser;

    const currentSid = React.useMemo(() => {
        if (!accessToken) return null;
        try {
            const decoded = jwtDecode<{ sid: string }>(accessToken);
            return decoded.sid;
        } catch (e) {
            return null;
        }
    }, [accessToken]);

    const sessions = (sessionsRes ?? []).map((s: any) => ({
        ...s,
        isCurrent: s.id === currentSid,
    }));

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        values: profile ? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' } : undefined,
    });

    const updateProfile = useMutation({
        mutationFn: (data: ProfileForm) => usersApi.updateProfile(data),
        onSuccess: (res) => {
            const updatedUser = res.data;
            if (updatedUser && accessToken && refreshToken) {
                setAuth(updatedUser, accessToken, refreshToken);
            }
            qc.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Core Identity Updated');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const revokeSession = useMutation({
        mutationFn: (id: string) => securityApi.revokeSession(id),
        onSuccess: (_, id) => {
            const isCurrent = sessions.find(s => s.id === id)?.isCurrent;
            if (isCurrent) {
                toast.success('Current access terminal revoked. Signing out...');
                clearAuth();
                router.replace('/login');
                return;
            }
            qc.invalidateQueries({ queryKey: ['sessions'] });
            toast.success('Access Terminal Revoked');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const disableMfa = useMutation({
        mutationFn: (password: string) => securityApi.disableMfa(password),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['mfa-status'] });
            toast.success('Security Shield Deactivated (MFA Disabled)');
            setDisableOpen(false);
            setConfirmPassword('');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Decrypting Identity Vault...</p>
            </div>
        );
    }

    return (
        <div className="centered-container py-12 max-w-4xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    System Configuration
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground font-medium text-lg italic">Control your platform identity and security protocols.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-12 lg:col-span-8 space-y-8">
                    {/* Identity Section */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card/60">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold font-display uppercase tracking-wider">Identity Console</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal Profile Information</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>First Name</label>
                                        <input {...register('firstName')} className={inputCls} />
                                        {errors.firstName && <p className="text-destructive text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">Required</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Last Name</label>
                                        <input {...register('lastName')} className={inputCls} />
                                        {errors.lastName && <p className="text-destructive text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">Required</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelCls}>Phone Protocol</label>
                                    <div className="relative group">
                                        <input {...register('phone')} placeholder="+00 0000000000" className={inputCls} />
                                        <Phone className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelCls}>Authorized Email (Locked)</label>
                                    <div className="relative group">
                                        <input value={profile?.email ?? ''} disabled className={inputCls + ' opacity-50 cursor-not-allowed bg-muted/20'} />
                                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || updateProfile.isPending}
                                        className="h-14 px-10 rounded-[2rem] font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/20"
                                    >
                                        {(isSubmitting || updateProfile.isPending) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Commit Changes'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>

                    {/* Terminal Access Section */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden glass">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <History className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold font-display uppercase tracking-wider">Access Terminals</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Auth Sessions</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {sessions.map((s: any) => {
                                    const deviceIcon = s.deviceInfo?.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
                                    const lastSeen = new Date(s.lastActiveAt).toLocaleString();

                                    return (
                                        <div key={s.id} className={cn(
                                            "flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 group",
                                            s.isCurrent ? "bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5" : "bg-muted/30 border-border/40 hover:bg-card hover:shadow-xl"
                                        )}>
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                    s.isCurrent ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                                                )}>
                                                    {deviceIcon}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold uppercase tracking-wider">
                                                            {s.deviceInfo?.os ?? 'Unknown OS'} • {s.deviceInfo?.browser ?? 'Unknown Browser'}
                                                        </h3>
                                                        {s.isCurrent && (
                                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none text-[8px] font-black tracking-[0.2em] px-2 py-0">
                                                                CURRENT
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <Globe className="h-3 w-3 opacity-30" />
                                                            {s.ipAddress ?? '0.0.0.0'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                                                            <History className="h-3 w-3 opacity-30" />
                                                            Active {lastSeen}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => revokeSession.mutate(s.id)}
                                                className="h-10 px-4 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5 font-bold uppercase tracking-widest text-[9px] transition-all"
                                            >
                                                <LogOut className="h-3.5 w-3.5 sm:mr-2" />
                                                <span className="hidden sm:inline">Revoke Access</span>
                                            </Button>
                                        </div>
                                    );
                                })}
                                {sessions.length === 0 && (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                                            <Shield className="h-8 w-8 text-muted-foreground/20" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">No active access terminals detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-12 lg:col-span-4 self-start space-y-8">
                    {/* Security Status Card */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-sidebar p-8 text-primary-foreground space-y-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="space-y-6 relative">
                            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-display">Security Shield</h3>
                                <p className="text-sm text-sidebar-foreground/60 font-medium leading-relaxed">
                                    Account protection is currently active with enterprise-grade encryption.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-primary-foreground/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest">2FA STATUS</span>
                                    <Badge variant={mfa?.enabled ? 'success' : 'warning'} className="rounded-lg px-2 py-0.5 text-[9px] border-none">
                                        {mfa?.enabled ? 'PROTECTED' : 'AT RISK'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest">TERMINALS</span>
                                    <span className="text-xs font-bold font-mono">{sessions.length}</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                {mfa?.enabled ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDisableOpen(true)}
                                        className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Disable MFA
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setSetupOpen(true)}
                                        className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Enable MFA
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Modals */}
                    <MfaSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />

                    <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Disable Security Shield?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will lower your account security. Please enter your password to confirm this action.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputCls}
                                    autoFocus
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setConfirmPassword('')}>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    disabled={!confirmPassword || disableMfa.isPending}
                                    onClick={() => disableMfa.mutate(confirmPassword)}
                                    className="rounded-xl font-bold uppercase tracking-widest text-xs h-10 px-6"
                                >
                                    {disableMfa.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Deactivation'}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Trust Indicators */}
                    <div className="px-4 space-y-6">
                        <div className="flex gap-4">
                            <Fingerprint className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] leading-relaxed">
                                Biometric auth protocols are enforced for high-sensitivity operations.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] leading-relaxed">
                                Identity vault is audit-compliant with JusticeLynk standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
