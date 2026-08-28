import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used in Server Components / route handlers for the COACH's authenticated
// session (anon key + the coach's own cookies, so RLS applies normally).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Called from a Server Component with no response to write to —
            // safe to ignore as long as middleware also refreshes sessions.
          }
        },
      },
    }
  );
}
