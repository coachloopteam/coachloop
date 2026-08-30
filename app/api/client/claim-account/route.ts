import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint hit by the client portal (/c/[token]) — same trust model as
// /api/log: the invite token IS the credential, validated server-side before
// touching anything. Creating the actual Supabase Auth user requires the
// service-role client (admin.createUser isn't callable with the anon key),
// which is also why this can't just be a client-side supabase.auth.signUp()
// call the way coach signup is.
//
// This only adds an OPTIONAL account on top of the existing invite_token
// flow — a client who never calls this keeps using their portal link
// exactly as before. There's no client-facing login form yet (see
// app/coach/login/page.tsx's honest "no account" panel); this route lays
// the groundwork for wiring one up.
export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json();

  if (!token || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, email, auth_user_id")
    .eq("invite_token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  if (client.auth_user_id) {
    return NextResponse.json({ error: "An account already exists for this link — sign in instead." }, { status: 409 });
  }

  // role: "client" tells the handle_new_coach trigger (supabase/schema.sql)
  // to skip inserting a coaches row for this auth user.
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "client", name: client.name },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Could not create account" }, { status: 400 });
  }

  const { error: linkError } = await supabase
    .from("clients")
    .update({ auth_user_id: created.user.id, email: client.email ?? email })
    .eq("id", client.id);

  if (linkError) {
    // The auth user now exists but isn't linked — clean it up rather than
    // leaving an orphaned account the client can't do anything useful with.
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Could not link account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
