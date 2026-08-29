"use client";

import { useRef, useState } from "react";

// Real, not fabricated: there's no messaging feature or backend in this app
// to "send" anything through. If the client has an email on file, this opens
// the coach's own email client via mailto: — a genuine send, no backend
// needed. Otherwise it copies the client's portal link so the coach can
// paste it into whatever channel (text, WhatsApp) they'd actually use.
export default function CheckInButton({
  clientName,
  email,
  inviteToken,
}: {
  clientName: string;
  email: string | null;
  inviteToken: string;
}) {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  if (email) {
    const subject = encodeURIComponent("Checking in");
    const body = encodeURIComponent(`Hey ${clientName.split(" ")[0]}, just checking in — how's it going?`);
    return (
      <a
        href={`mailto:${email}?subject=${subject}&body=${body}`}
        className="shrink-0 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
      >
        Send Check-in Note
      </a>
    );
  }

  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${inviteToken}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      linkRef.current?.select();
    }
  }

  return (
    <div className="shrink-0">
      <input ref={linkRef} readOnly value={portalUrl} className="sr-only" aria-hidden tabIndex={-1} />
      <button
        onClick={copyLink}
        className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
      >
        {copied ? "Link Copied!" : "Copy Portal Link"}
      </button>
    </div>
  );
}
