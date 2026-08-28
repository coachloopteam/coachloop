import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

// Called from the coach dashboard. Uses the coach's own authenticated
// session (not the admin client) so RLS confirms they're a real coach
// before a client row is created under them.
export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("auth_user_id", auth.user.id)
    .single();

  if (!coach) {
    return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
  }

  const invite_token = nanoid(16);

  const { data: client, error } = await supabase
    .from("clients")
    .insert({ coach_id: coach.id, name, email: email || null, invite_token })
    .select()
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Could not create client" }, { status: 500 });
  }

  return NextResponse.json({ client, portalPath: `/c/${invite_token}` });
}
