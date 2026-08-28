import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import LogForm from "@/components/LogForm";

export default async function ClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, coach_id, coaches(name, business_name)")
    .eq("invite_token", token)
    .single();

  if (!client) notFound();

  const coach = Array.isArray(client.coaches) ? client.coaches[0] : client.coaches;

  const { data: history } = await supabase
    .from("logs")
    .select("id, type, content, logged_at, ai_feedback(feedback)")
    .eq("client_id", client.id)
    .order("logged_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Hey {client.name} 👋</h1>
          <p className="text-sm text-neutral-500">
            Coached by {coach?.business_name || coach?.name || "your coach"}
          </p>
        </div>

        <LogForm token={token} />

        <div className="space-y-3">
          {history?.map((h) => {
            const fb = Array.isArray(h.ai_feedback) ? h.ai_feedback[0] : h.ai_feedback;
            return (
              <div key={h.id} className="bg-white border border-neutral-200 rounded-xl p-4 text-sm space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {h.type} · {new Date(h.logged_at).toLocaleString()}
                </p>
                <p>{h.content}</p>
                {fb?.feedback && <p className="text-neutral-600 italic">{fb.feedback}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
