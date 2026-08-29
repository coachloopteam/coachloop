import { notFound } from "next/navigation";
import WorkoutHub from "@/components/concept/WorkoutHub";
import RecipeVault from "@/components/concept/RecipeVault";

// Design concept / blueprint only — not linked from real coach navigation and
// not wired to Supabase. There is no discipline column, workout-assignment
// table, or recipes table in the current schema; "Assign" shows a
// confirmation but persists nothing. See components/concept/mock-data.ts.
//
// Gated the same way as the client-dashboard concept preview: a single
// shared DESIGN_PREVIEW_TOKEN in the URL, not coach Supabase Auth.
export default async function ActivityHubDesignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const expected = process.env.DESIGN_PREVIEW_TOKEN;
  if (!expected || token !== expected) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
        Design concept — sample data, not wired to a real account. See components/concept/.
      </div>
      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        <WorkoutHub />
        <RecipeVault />
      </div>
    </div>
  );
}
