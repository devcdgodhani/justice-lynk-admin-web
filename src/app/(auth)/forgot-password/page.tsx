'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, KeyRound, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { authApi } from '@/services/auth.api';

// ─── Schemas ─────────────────────────────────────────────────────────────────
const step1Schema = z.object({ email: z.string().email('Enter a valid email') });
const step2Schema = z.object({ otp: z.string().length(6, 'Enter the 6-digit code') });
const step3Schema = z.object({
    newPassword: z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

const OTP_LENGTH = 6;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [otp, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Step 1 Form
    const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
    // Step 3 Form
    const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) });

    // ── Step 1: Email ─────────────────────────────────────────────────────────
    const onStep1 = async (data: Step1) => {
        setLoading(true);
        try {
            await authApi.forgotPassword({ email: data.email });
            setEmail(data.email);
            setStep(2);
            toast.success('If an account exists, a reset code has been sent');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: OTP ───────────────────────────────────────────────────────────
    const handleOtpInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtpDigits(next);
        if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
        if (next.every(Boolean)) handleOtpSubmit(next.join(''));
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (text.length !== OTP_LENGTH) return;
        setOtpDigits(text.split(''));
        handleOtpSubmit(text);
    };

    const handleOtpSubmit = async (code: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await authApi.verifyForgotPasswordOtp({ email, otp: code });
            setResetToken(res.data.resetToken);
            setStep(3);
            toast.success('Code verified! Set your new password.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid or expired code');
            setOtpDigits(Array(OTP_LENGTH).fill(''));
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: New Password ──────────────────────────────────────────────────
    const onStep3 = async (data: Step3) => {
        setLoading(true);
        try {
            await authApi.resetPassword({ resetToken, newPassword: data.newPassword });
            setStep(4);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // ── Progress steps ────────────────────────────────────────────────────────
    const steps = [
        { label: 'Email', icon: Mail },
        { label: 'Verify Code', icon: KeyRound },
        { label: 'New Password', icon: Lock },
    ];

    // ── Step 4: Success ───────────────────────────────────────────────────────
    if (step === 4) {
        return (
            <div className="card p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground">Password Reset!</h2>
                <p className="text-muted-foreground mt-2 text-sm mb-6">
                    Your password has been updated. You can now log in.
                </p>
                <button onClick={() => router.replace('/login')} className="btn-primary w-full">
                    Go to Login →
                </button>
            </div>
        );
    }

    return (
        <div className="card p-8">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    {step === 1 ? "Enter your email and we'll send a reset code" :
                        step === 2 ? 'Enter the 6-digit code sent to your email' :
                            'Create your new password'}
                </p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((s, i) => {
                    const idx = i + 1;
                    const done = step > idx;
                    const active = step === idx;
                    const Icon = s.icon;
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${done ? 'bg-green-500/15 text-green-500' :
                                    active ? 'bg-primary/15 text-primary' :
                                        'bg-muted text-muted-foreground'
                                }`}>
                                <Icon className="w-3 h-3" />
                                {s.label}
                            </div>
                            {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                    );
                })}
            </div>

            {/* Step 1 */}
            {step === 1 && (
                <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                        <input {...form1.register('email')} type="email" placeholder="john@example.com" className="input w-full" autoFocus />
                        {form1.formState.errors.email && (
                            <p className="text-xs text-destructive mt-1">{form1.formState.errors.email.message}</p>
                        )}
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending…</> : 'Send Reset Code →'}
                    </button>
                </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
                <div>
                    <p className="text-center text-sm text-muted-foreground mb-5">
                        Code sent to <span className="text-foreground font-medium">{email}</span>
                    </p>
                    <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpInput(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                disabled={loading}
                                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background outline-none transition-all
                                    ${digit ? 'border-primary' : 'border-border'}
                                    focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
                            />
                        ))}
                    </div>
                    {loading && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                        </div>
                    )}
                    <button
                        onClick={() => { setStep(1); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
                        className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                    >
                        ← Use a different email
                    </button>
                </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
                <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                        <input {...form3.register('newPassword')} type="password" placeholder="Min 8 chars, A-z, 0-9, @$!%*?&" className="input w-full" autoFocus />
                        {form3.formState.errors.newPassword && (
                            <p className="text-xs text-destructive mt-1">{form3.formState.errors.newPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                        <input {...form3.register('confirm')} type="password" placeholder="Repeat password" className="input w-full" />
                        {form3.formState.errors.confirm && (
                            <p className="text-xs text-destructive mt-1">{form3.formState.errors.confirm.message}</p>
                        )}
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting…</> : 'Reset Password →'}
                    </button>
                </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-8">
                <Link href="/login" className="hover:text-primary transition-colors">← Back to login</Link>
            </p>
        </div>
    );
}
