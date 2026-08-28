import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components (coach dashboard interactivity). Uses the public
// anon key only — safe to ship to the browser, RLS protects the data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
