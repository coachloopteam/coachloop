import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the SERVICE ROLE key — bypasses RLS entirely.
// Only import this from files under app/api/**, never from anything that
// ships to the browser. This is how the token-based client portal (which has
// no Supabase Auth session) is allowed to read/write its own rows.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
