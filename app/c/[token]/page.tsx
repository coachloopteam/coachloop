import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import LogForm from "@/components/LogForm";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">Hey {client.name} 👋</h1>
          <p className="text-sm text-stone-500">
            Coached by {coach?.business_name || coach?.name || "your coach"}
          </p>
        </div>

        <div className="animate-fade-in-up">
          <LogForm token={token} />
        </div>

        <div className="space-y-3">
          {history?.map((h, i) => {
            const fb = Array.isArray(h.ai_feedback) ? h.ai_feedback[0] : h.ai_feedback;
            return (
              <Card
                key={h.id}
                className="animate-fade-in-up space-y-1.5 p-4 text-sm"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <div className="flex items-center gap-2">
                  <Badge className="capitalize">{h.type}</Badge>
                  <p className="text-xs text-stone-400">{new Date(h.logged_at).toLocaleString()}</p>
                </div>
                <p className="text-stone-800">{h.content}</p>
                {fb?.feedback && (
                  <p className="rounded-xl border border-stone-100 bg-stone-50 p-2.5 italic text-stone-600">
                    {fb.feedback}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
