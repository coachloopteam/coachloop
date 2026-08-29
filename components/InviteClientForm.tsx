"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function InviteClientForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/coach/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setLink(`${window.location.origin}${data.portalPath}`);
      setName("");
      setEmail("");
      router.refresh();
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-stone-900">Invite a client</h2>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2.5">
        <Input
          className="min-w-[140px] flex-1"
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          className="min-w-[140px] flex-1"
          placeholder="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create invite link"}
        </Button>
      </form>
      {link && (
        <p className="animate-fade-in mt-3 break-all rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-sm">
          Send this to your client: <span className="font-mono text-stone-700">{link}</span>
        </p>
      )}
    </Card>
  );
}
