'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div className="glass rounded-2xl p-8 shadow-2xl animate-fade-in">
            <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Contact your administrator or use the registered email for password recovery.
                </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary/90">
                    <strong>Note:</strong> Self-service password reset via email is managed by organization administrators. Please reach out to your admin for assistance.
                </p>
            </div>

            <Link href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary border border-border text-foreground font-medium rounded-lg hover:bg-accent transition-all">
                ← Back to Login
            </Link>
        </div>
    );
}
