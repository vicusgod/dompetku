import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 1. Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 2. Get session from cookies (no network call - works offline)
    // Using getSession() instead of getUser() because:
    // - getSession() reads from cookies/localStorage (offline-compatible)
    // - getUser() makes a network request to verify token (fails offline)
    const {
        data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user ?? null

    // 3. Check for Guest Mode cookie
    const isGuestMode = request.cookies.get('duit-guest-mode')?.value === 'true';

    // 4. Protect routes (allow if user OR guest mode)
    const protectedRoutes = ['/dashboard', '/budget', '/wallets', '/transactions', '/settings'];
    const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    if (isProtected && !user && !isGuestMode) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 4. Redirect logged-in users away from auth pages
    if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
