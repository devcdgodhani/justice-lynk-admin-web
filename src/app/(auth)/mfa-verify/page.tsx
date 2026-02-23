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
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';

const mfaSchema = z.object({
    token: z.string().length(6, 'Enter the 6-digit code from your authenticator app'),
});

type MfaForm = z.infer<typeof mfaSchema>;

function MfaVerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') ?? '';
    const { setAuth } = useAuthStore();
    const [useBackup, setUseBackup] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MfaForm>({
        resolver: zodResolver(useBackup ? z.object({ token: z.string().min(1) }) : mfaSchema),
    });

    const onSubmit = async (data: MfaForm) => {
        try {
            let result;
            if (useBackup) {
                result = await authApi.mfaBackupCode(userId, data.token);
            } else {
                result = await authApi.mfaVerify({ userId, token: data.token });
            }
            const { user, accessToken, refreshToken } = result.data;
            setAuth(user, accessToken, refreshToken);
            document.cookie = `jl-access-token=${accessToken}; path=/; max-age=900; SameSite=Strict`;

            router.push('/admin');
            toast.success('Verified successfully!');
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <div className="glass rounded-2xl p-8 shadow-glass animate-fade-in">
            <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full brand-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <Shield className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    {useBackup ? 'Enter one of your backup codes' : 'Enter the 6-digit code from your authenticator app'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <input
                        {...register('token')}
                        type="text"
                        inputMode={useBackup ? 'text' : 'numeric'}
                        maxLength={useBackup ? 20 : 6}
                        placeholder={useBackup ? 'XXXXXXXX-XXXX' : '000000'}
                        autoFocus
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl font-mono tracking-[0.5em]"
                    />
                    {errors.token && <p className="text-destructive text-xs mt-1 text-center font-medium">{errors.token.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting || !userId}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 brand-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Sign In'}
                </button>
            </form>

            <div className="mt-4 text-center space-y-2">
                <button onClick={() => setUseBackup(!useBackup)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors">
                    {useBackup ? 'Use authenticator app instead' : 'Use a backup code instead'}
                </button>
                <div>
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
