import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/verify-email',
    '/mfa-verify',
    '/mfa-backup-code',
    '/forgot-password',
];


export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/images')
    ) {
        return NextResponse.next();
    }

    // Check for auth token in cookies (we'll also set it there)
    const token = request.cookies.get('jl-access-token')?.value;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/cases') ||
        pathname.startsWith('/chat') || pathname.startsWith('/organization') ||
        pathname.startsWith('/billing') || pathname.startsWith('/settings') ||
        pathname.startsWith('/notifications') || pathname.startsWith('/professionals') ||
        pathname.startsWith('/admin');

    // Redirect authenticated users away from auth pages
    if (token && isPublic) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Redirect /dashboard to /admin for convenience
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!token && isDashboard) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
