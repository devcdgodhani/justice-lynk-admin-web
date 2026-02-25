'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth.store';


const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (next.every(Boolean)) handleVerify(next.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (text.length !== OTP_LENGTH) return;
    const next = text.split('');
    setOtp(next);
    inputRefs.current[OTP_LENGTH - 1]?.focus();
    handleVerify(text);
  };

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, otp: code });
      const { user, accessToken, refreshToken } = res.data;
      if (accessToken) {
        setAuth(user!, accessToken, refreshToken!);
      }
      setVerified(true);
      toast.success('Email verified! Welcome to JusticeLynk 🎉');
      setTimeout(() => router.replace('/admin'), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success('A new code has been sent to your email');
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Email Verified!</h2>
        <p className="text-muted-foreground mt-2 text-sm">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent a 6-digit code to<br />
          <span className="text-foreground font-medium">{email || 'your email'}</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background outline-none transition-all
              ${digit ? 'border-primary text-foreground' : 'border-border text-foreground'}
              focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:opacity-50`}
          />
        ))}
      </div>

      {loading && (
        <div className="items-center justify-center gap-2 text-muted-foreground text-sm mb-4 hidden">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="flex items-center gap-2 mx-auto text-sm font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
        >
          {resending
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
            : countdown > 0
              ? <><RefreshCw className="w-3.5 h-3.5" /> Resend in {countdown}s</>
              : <><RefreshCw className="w-3.5 h-3.5" /> Resend code</>
          }
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        <Link href="/login" className="hover:text-primary transition-colors">← Back to login</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
