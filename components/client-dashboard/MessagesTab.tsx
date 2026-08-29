// Empty-state only — there's no messaging feature or schema in the app
// today. This exists to make the bottom tab bar's third destination feel
// real rather than a dead link, not to imply chat is built.
export default function MessagesTab({ coachName }: { coachName: string }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-2xl" aria-hidden>
        💬
      </span>
      <p className="mt-4 text-sm font-semibold text-stone-900">No messages yet</p>
      <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-stone-500">
        {coachName} will reach out here when they have feedback for you.
      </p>
    </div>
  );
}
