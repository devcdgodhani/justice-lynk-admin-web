'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, Scale, X } from 'lucide-react';
import { authApi } from '@/services/auth.api';

const schema = z.object({
    firstName: z.string().min(1, 'Required').max(50),
    lastName: z.string().min(1, 'Required').max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;
type UserType = 'client' | 'professional';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'pick' | 'form'>('pick');
    const [userType, setUserType] = useState<UserType>('client');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await authApi.register({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                userType,
            });
            toast.success(res.message || 'Check your email for the verification code!');
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1: Pick user type ─────────────────────────────────────────────────
    if (step === 'pick') {
        return (
            <div className="card p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Tell us how you plan to use JusticeLynk</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Client */}
                    <button
                        onClick={() => { setUserType('client'); }}
                        className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${userType === 'client'
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                    >
                        {userType === 'client' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full brand-gradient flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${userType === 'client' ? 'brand-gradient' : 'bg-muted'}`}>
                            <User className={`w-6 h-6 ${userType === 'client' ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-foreground">Client</p>
                            <p className="text-xs text-muted-foreground mt-1">Seeking legal services</p>
                        </div>
                    </button>

                    {/* Professional */}
                    <button
                        onClick={() => { setUserType('professional'); }}
                        className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${userType === 'professional'
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                    >
                        {userType === 'professional' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full brand-gradient flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${userType === 'professional' ? 'brand-gradient' : 'bg-muted'}`}>
                            <Scale className={`w-6 h-6 ${userType === 'professional' ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-foreground">Professional</p>
                            <p className="text-xs text-muted-foreground mt-1">Professional / Detective</p>
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => setStep('form')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 brand-gradient text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    Continue as {userType === 'client' ? 'Client' : 'Professional'} →
                </button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
          </div>
      );
  }

    // ── Step 2: Registration form ──────────────────────────────────────────────
    return (
      <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
              <button
                  onClick={() => setStep('pick')}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                  <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <div>
                  <h1 className="text-xl font-bold text-foreground">Create your account</h1>
                  <p className="text-xs text-muted-foreground">
                      Registering as{' '}
                      <span className="text-primary font-medium capitalize">{userType}</span>
                  </p>
              </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                        <input {...register('firstName')} placeholder="John" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                        <input {...register('lastName')} placeholder="Doe" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input {...register('email')} type="email" placeholder="john@example.com" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-muted-foreground">(optional)</span></label>
                    <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <input {...register('password')} type="password" placeholder="Min 8 chars, must include A-z, 0-9, @$!%*?&" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                    <input {...register('confirm')} type="password" placeholder="Repeat password" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                  {errors.confirm && <p className="text-xs text-destructive mt-1">{errors.confirm.message}</p>}
              </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 brand-gradient text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 mt-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account…</> : 'Create Account →'}
                </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
      </div>
  );
}
