import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { training_philosophy, nutrition_rules, tone, banned_topics } = await req.json();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { error } = await supabase
    .from("coaches")
    .update({ training_philosophy, nutrition_rules, tone, banned_topics })
    .eq("auth_user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
