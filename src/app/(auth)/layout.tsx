export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl opacity-20" />
            </div>
            <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-foreground">JusticeLynk</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Enterprise Legal Platform</p>
                </div>
                {children}
            </div>
        </div>
    );
}
