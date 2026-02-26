'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') ?? '/admin';
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        try {
            const result = await authApi.login(data);
            const { data: loginData } = result;

            // Email not yet verified — redirect to OTP screen
            if (loginData.emailVerificationRequired) {
                toast.info('Please verify your email to continue');
                router.push(`/verify-email?email=${encodeURIComponent(loginData.email ?? data.email)}`);
                return;
            }

            // MFA required — store temp token in sessionStorage
            if (loginData.mfaRequired) {
                if (loginData.mfaTempToken) sessionStorage.setItem('jl_mfa_temp', loginData.mfaTempToken);
                router.push('/mfa-verify');
                return;
            }

            if (loginData.user && loginData.accessToken && loginData.refreshToken) {
                setAuth(loginData.user, loginData.accessToken, loginData.refreshToken);
                router.push(redirect);
            }
        } catch (err) {
            const message = getErrorMessage(err);
            if (message.includes('429') || message.toLowerCase().includes('rate')) {
                toast.error('Too many attempts. Please try again later.', { duration: 5000 });
            } else {
                toast.error(message || 'Invalid credentials');
            }
        }
    };

    return (
        <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Authority Access</h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium">Secure authentication for platform administrators.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                        Security Identifier
                    </label>
                    <Input
                        {...register('email')}
                        type="email"
                        placeholder="admin@justicelynk.com"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                    />
                    {errors.email && (
                        <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Access Token
                        </label>
                        <Link href="/forgot-password" virtual-link="true" className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                            Reset Key
                        </Link>
                    </div>
                    <div className="relative group">
                        <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="gradient"
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <LogIn className="h-4 w-4" />
                                Initialize Session
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground font-medium">
                    New personnel?{' '}
                    <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                        Request Credentials
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
