import { notFound } from "next/navigation";
import MediaHub from "@/components/concept/MediaHub";

// Design concept / blueprint only — not linked from real coach or client
// navigation, not wired to Supabase, and there is no video hosting or
// streaming feature in this app. See components/concept/MediaHub.tsx.
//
// Gated the same way as the other concept previews: a single shared
// DESIGN_PREVIEW_TOKEN in the URL, not real Supabase Auth.
export default async function MediaHubDesignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const expected = process.env.DESIGN_PREVIEW_TOKEN;
  if (!expected || token !== expected) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
        Design concept — sample data, not wired to a real account. See components/concept/.
      </div>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <MediaHub />
      </div>
    </div>
  );
}
