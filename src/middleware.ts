import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For now, this is a minimal middleware that doesn't block routes
// since we don't have Supabase connected yet.
// When Supabase is configured, uncomment the full implementation.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/sign-in', '/upload'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // For now, route protection is handled client-side
  // In production with Supabase:
  // 1. Check session via supabase/ssr createServerClient
  // 2. If no session and not on public route → redirect to /sign-in
  // 3. If session exists and on /sign-in → redirect to appropriate dashboard
  // 4. Check role-based access for /admin/* and /hr/* routes

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
