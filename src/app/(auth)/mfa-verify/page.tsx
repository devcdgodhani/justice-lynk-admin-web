'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth.store';


const mfaSchema = z.object({
    token: z.string().min(6, 'Enter the 6-digit code').max(8),
});
type MfaForm = z.infer<typeof mfaSchema>;

function MfaVerifyContent() {
    const router = useRouter();
    const params = useSearchParams();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [loading, setLoading] = useState(false);

    // mfaTempToken is stored in sessionStorage by the login page
    const mfaTempToken = typeof window !== 'undefined'
        ? (sessionStorage.getItem('jl_mfa_temp') ?? params.get('t') ?? '')
        : '';

    const { register, handleSubmit, formState: { errors } } = useForm<MfaForm>({
        resolver: zodResolver(mfaSchema),
    });

    const onSubmit = async (data: MfaForm) => {
        if (!mfaTempToken) {
            toast.error('MFA session expired. Please login again.');
            router.replace('/login');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.mfaVerify({ mfaTempToken, token: data.token });
            const { user, accessToken, refreshToken } = res.data;
            setAuth(user!, accessToken!, refreshToken!);
            sessionStorage.removeItem('jl_mfa_temp');
            toast.success('Verified successfully!');
            router.replace('/admin');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid MFA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-8">
            <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <Shield className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Enter the 6-digit code from your authenticator app
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Authentication Code</label>
                    <input
                        {...register('token')}
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="000000"
                        autoFocus
                        className="input w-full text-center text-2xl font-bold tracking-[0.5em]"
                    />
                    {errors.token && <p className="text-xs text-destructive mt-1 text-center">{errors.token.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying…</> : 'Verify & Sign In →'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
                <p className="text-sm text-muted-foreground">Lost access to your authenticator?</p>
                <Link href="/mfa-backup-code" className="text-sm text-primary hover:underline font-medium">
                    Use a backup code
                </Link>
                <div className="pt-1">
                    <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function MfaVerifyPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <MfaVerifyContent />
        </Suspense>
    );
}
