'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth.store';


const schema = z.object({
    backupCode: z.string().min(8, 'Enter your 8-character backup code').max(8),
});
type FormData = z.infer<typeof schema>;

function MfaBackupCodeContent() {
    const router = useRouter();
    const params = useSearchParams();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [loading, setLoading] = useState(false);

    const mfaTempToken = typeof window !== 'undefined'
        ? (sessionStorage.getItem('jl_mfa_temp') ?? params.get('t') ?? '')
        : '';

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        if (!mfaTempToken) {
            toast.error('Session expired. Please login again.');
            router.replace('/login');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.mfaBackupCode({ mfaTempToken, backupCode: data.backupCode.toUpperCase() });
            const { user, accessToken, refreshToken } = res.data;
            document.cookie = `jl-access-token=${accessToken!}; path=/; max-age=900; SameSite=Strict`;
            setAuth(user!, accessToken!, refreshToken!);
            sessionStorage.removeItem('jl_mfa_temp');
            toast.success('Signed in with backup code');
            router.replace('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid backup code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-8">
            <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <KeyRound className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Use a backup code</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Enter one of the 8-character backup codes you saved during setup
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Backup Code</label>
                    <input
                        {...register('backupCode')}
                        type="text"
                        maxLength={8}
                        placeholder="A1B2C3D4"
                        autoFocus
                        autoCapitalize="characters"
                        className="input w-full text-center text-xl font-bold tracking-[0.4em] uppercase"
                    />
                    {errors.backupCode && <p className="text-xs text-destructive mt-1 text-center">{errors.backupCode.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying…</> : 'Verify & Sign In →'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
                <Link href="/mfa-verify" className="text-sm text-primary hover:underline font-medium">
                    Use authenticator app instead
                </Link>
                <div className="mt-2">
                    <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function MfaBackupCodePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <MfaBackupCodeContent />
        </Suspense>
    );
}
