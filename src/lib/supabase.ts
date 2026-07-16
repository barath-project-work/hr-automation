import { createBrowserClient } from '@supabase/ssr';

// Supabase configuration
// These will be replaced with actual values when Supabase is connected
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Singleton pattern for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get the Supabase browser client (for client components)
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/**
 * Get the Supabase server client (for server components and actions)
 * In a real setup, this would use @supabase/ssr's createServerClient
 */
export async function getSupabaseServerClient() {
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
