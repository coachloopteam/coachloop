import { createClient } from "@supabase/supabase-js";
import { E2E_COACH_EMAIL, E2E_COACH_PASSWORD } from "./test-coach";

// Runs once before the test suite. Creates a confirmed coach account via the
// Supabase admin API so the test doesn't depend on the project's email-
// confirmation setting — the auth.users trigger (see supabase/schema.sql
// comments) creates the matching `coaches` row automatically.
export default async function globalSetup() {
  process.loadEnvFile(".env.local");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local to run the e2e checkout test."
    );
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: existing, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;
  const match = existing.users.find((u) => u.email === E2E_COACH_EMAIL);
  if (match) await admin.auth.admin.deleteUser(match.id);

  const { error: createError } = await admin.auth.admin.createUser({
    email: E2E_COACH_EMAIL,
    password: E2E_COACH_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Playwright Test Coach" },
  });
  if (createError) throw createError;
}
