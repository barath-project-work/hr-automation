import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that don't need authentication
const PUBLIC_ROUTES = ['/sign-in', '/upload'];

// Routes only admins can access
const ADMIN_ROUTES = ['/admin'];

// Routes only HRs can access
const HR_ROUTES = ['/hr'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Allow public routes & API routes through immediately ─────
  // (API routes enforce their own authentication and authorization checks)
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith('/api/');
  if (isPublic || isApiRoute) return NextResponse.next();

  // ── 2. Set up a response we can mutate (for cookie refresh) ─
  let response = NextResponse.next({ request });

  // ── 3. Create a Supabase client that can read + write cookies ─
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto both the request and the response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── 4. Refresh the session (IMPORTANT: do not remove this) ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 5. No session → redirect to sign-in ────────────────────
  if (!user) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', pathname); // Remember where they were going
    return NextResponse.redirect(signInUrl);
  }

  // ── 6. Fetch the user's role ────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id, is_active')
    .eq('id', user.id)
    .single();

  // If profile not found or deactivated, sign them out
  if (!profile || !profile.is_active) {
    const signInUrl = new URL('/sign-in', request.url);
    const logoutResponse = NextResponse.redirect(signInUrl);
    logoutResponse.cookies.delete('sb-access-token');
    logoutResponse.cookies.delete('sb-refresh-token');
    return logoutResponse;
  }

  // role_id 1 = admin, 2 = hr (matches the roles table seed data)
  const role: string = profile.role_id === 1 ? 'admin' : 'hr';

  // ── 7. If signed in and visiting /sign-in → redirect to dashboard ──
  if (pathname === '/sign-in') {
    const dashboard = role === 'admin' ? '/admin/dashboard' : '/hr/dashboard';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // ── 8. Role-based route protection ─────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isHRRoute    = HR_ROUTES.some((r) => pathname.startsWith(r));

  if (isAdminRoute && role !== 'admin') {
    // HR trying to access admin area → send to their dashboard
    return NextResponse.redirect(new URL('/hr/dashboard', request.url));
  }

  if (isHRRoute && role !== 'hr') {
    // Admin trying to access HR area → send to their dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // ── 9. All good — let the request through ──────────────────
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - *.svg, *.png, *.jpg, *.ico (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)',
  ],
};
