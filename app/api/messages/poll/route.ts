import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint hit by the client portal (/c/[token]) — same tokenless
// pattern as /api/log and /api/daily-log. Tokenless clients have no
// auth.uid() for RLS to key off, so they can't safely use a direct
// Supabase Realtime subscription on `messages` the way the coach's
// authenticated dashboard does; this is polled every few seconds instead
// (see components/ChatPanel.tsx) — an approximation of real-time that
// stays within the token-validated, service-role-only access pattern the
// rest of this app already uses for tokenless clients.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const since = req.nextUrl.searchParams.get("since");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("invite_token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  let query = supabase
    .from("messages")
    .select("id, sender_role, content, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: true });

  if (since) query = query.gt("created_at", since);

  const { data: messages } = await query;

  return NextResponse.json({ messages: messages ?? [] });
}
