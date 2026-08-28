"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
      <h2 className="font-medium">Invite a client</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          className="border border-neutral-300 rounded-lg px-3 py-2 flex-1 min-w-[140px]"
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border border-neutral-300 rounded-lg px-3 py-2 flex-1 min-w-[140px]"
          placeholder="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create invite link"}
        </button>
      </form>
      {link && (
        <p className="text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 break-all">
          Send this to your client: <span className="font-mono">{link}</span>
        </p>
      )}
    </div>
  );
}
