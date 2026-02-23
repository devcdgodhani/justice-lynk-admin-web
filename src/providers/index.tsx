'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { AuthProvider } from './AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: (failureCount, error: unknown) => {
                            const status = (error as { response?: { status?: number } })?.response?.status;
                            if (status === 401 || status === 403 || status === 404) return false;
                            return failureCount < 2;
                        },
                    },
                    mutations: {
                        retry: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        theme="dark"
                        toastOptions={{
                            style: {
                                background: 'hsl(222 47% 8%)',
                                border: '1px solid hsl(222 47% 14%)',
                                color: 'hsl(213 31% 91%)',
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
