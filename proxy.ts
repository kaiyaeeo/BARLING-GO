    import { NextResponse, type NextRequest } from 'next/server'
    import { updateSession } from '@/lib/supabase/middleware'

    const PUBLIC_ROUTES = ['/', '/wisata', '/kuliner', '/oleh-oleh']
    const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

    export async function proxy(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request)
    const { pathname } = request.nextUrl

    // Kalau sudah login dan akses halaman auth, redirect ke dashboard
    if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Proteksi route user
    if (!user && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!user && pathname.startsWith('/pesanan')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!user && pathname.startsWith('/checkout')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Proteksi route admin
    if (pathname.startsWith('/admin')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))
        // Pengecekan role dilakukan di layout masing-masing
    }

    // Proteksi route super-admin
    if (pathname.startsWith('/super-admin')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))
    }

    return supabaseResponse
    }

    export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
    }