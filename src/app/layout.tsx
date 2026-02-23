import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: {
        default: 'JusticeLynk — Legal Case Management Platform',
        template: '%s | JusticeLynk',
    },
    description: 'Enterprise-grade legal case management, connecting legal professionals with clients.',
    keywords: ['legal', 'case management', 'law', 'advocates', 'court', 'legal tech'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head suppressHydrationWarning>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
