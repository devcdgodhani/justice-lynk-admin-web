'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            const { firstName, lastName, email, password } = data;
            const result = await authApi.register({ firstName, lastName, email, password });
            const { user, accessToken, refreshToken } = result.data;
            setAuth(user, accessToken, refreshToken);
            document.cookie = `jl-access-token=${accessToken}; path=/; max-age=900; SameSite=Strict`;

            router.push('/admin');
            toast.success('Account created successfully!');
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <div className="glass rounded-2xl p-8 shadow-glass animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
                <p className="text-muted-foreground mt-1 text-sm">Join the JusticeLynk platform</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                        <input {...register('firstName')} placeholder="John"
                            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                        {errors.firstName && <p className="text-destructive text-xs mt-1 font-medium">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                        <input {...register('lastName')} placeholder="Doe"
                            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                        {errors.lastName && <p className="text-destructive text-xs mt-1 font-medium">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                    <input {...register('email')} type="email" placeholder="you@example.com"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                    {errors.email && <p className="text-destructive text-xs mt-1 font-medium">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <input {...register('password')} type="password" placeholder="Minimum 8 characters"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                    {errors.password && <p className="text-destructive text-xs mt-1 font-medium">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                    <input {...register('confirmPassword')} type="password" placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                    {errors.confirmPassword && <p className="text-destructive text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 brand-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Create Account</>}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
