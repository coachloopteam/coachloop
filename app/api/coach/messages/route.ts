import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called from the coach's per-client thread (app/coach/clients/[id]).
// Uses the coach's own authenticated session — RLS ("coach sends messages
// to own clients" in supabase/schema_v2_proposed.sql) confirms the target
// client actually belongs to them before the insert is allowed, same
// pattern as /api/coach/invite.
export async function POST(req: NextRequest) {
  const { clientId, content } = await req.json();
  if (!clientId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ client_id: clientId, sender_role: "coach", content: content.trim() })
    .select()
    .single();

  if (error || !message) {
    // RLS silently returns no row (not an insert error) if this client
    // doesn't belong to the signed-in coach — same "not yours" result
    // either way, no need to distinguish for the caller.
    return NextResponse.json({ error: "Could not send message" }, { status: 403 });
  }

  return NextResponse.json({ message });
}
