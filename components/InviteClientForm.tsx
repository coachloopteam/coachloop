"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function InviteClientForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const linkInputRef = useRef<HTMLInputElement>(null);

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

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail for reasons a non-technical user has no way
      // to diagnose (permission prompts, older browsers, non-HTTPS edge
      // cases) — silently doing nothing would look broken. Select the link
      // text instead so tapping "Copy Link" always does *something* visible
      // and they can still copy it by hand.
      linkInputRef.current?.select();
    }
  }

  function inviteAnother() {
    setLink(null);
    setCopied(false);
  }

  // Collapsed: one big, obvious card — matches the other big action cards on
  // the dashboard. No hidden menus, nothing to learn.
  if (!open && !link) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 rounded-3xl border-2 border-dashed border-stone-200 bg-white p-6 text-left transition-all duration-200 ease-out hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.99]"
      >
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
          aria-hidden
        >
          <UserPlus className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span>
          <span className="block text-lg font-semibold text-stone-900">Invite a New Client</span>
          <span className="block text-sm text-stone-500">Get them started in seconds</span>
        </span>
      </button>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
        <UserPlus className="h-5 w-5 text-stone-400" strokeWidth={1.75} aria-hidden />
        Invite a New Client
      </h2>

      {!link ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input
            className="py-3.5 text-base"
            placeholder="Their name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            className="py-3.5 text-base"
            placeholder="Their email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2.5">
            <Button type="submit" disabled={loading} className="flex-1 py-3.5 text-base">
              {loading ? "Sending…" : "Send Invite"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="py-3.5 text-base">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="animate-fade-in mt-4 space-y-3">
          <p className="flex items-center gap-2 text-base font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            All set! Share this link with them:
          </p>
          {/* A readonly input, not a <p> — tapping/clicking it selects the
              text everywhere with zero JS, which is the reliable fallback
              if the Clipboard API below ever fails. */}
          <input
            ref={linkInputRef}
            readOnly
            value={link}
            onClick={(e) => e.currentTarget.select()}
            className="w-full rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3 font-mono text-sm text-stone-700 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <div className="flex gap-2.5">
            <Button type="button" onClick={copyLink} className="flex-1 py-3.5 text-base">
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button type="button" variant="secondary" onClick={inviteAnother} className="py-3.5 text-base">
              Invite Another
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
