import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─────────────────────────────────────────────────────────────
// Browser Client (for Client Components)
// Uses the anon key — subject to RLS policies
// ─────────────────────────────────────────────────────────────

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// ─────────────────────────────────────────────────────────────
// Server Client (for Server Components & Server Actions)
// Uses the anon key — subject to RLS policies
// Reads/writes session cookies so auth persists across requests
// ─────────────────────────────────────────────────────────────

export async function getSupabaseServerClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can throw in Server Components (read-only context).
          // Safe to ignore — the middleware handles cookie refresh.
        }
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Admin Client (for privileged Server Actions only)
// Uses the service_role key — BYPASSES RLS
// NEVER import this in client components
// Used for: creating/deleting auth users, admin operations
// ─────────────────────────────────────────────────────────────

let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClientInstance) {
    adminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClientInstance;
}
