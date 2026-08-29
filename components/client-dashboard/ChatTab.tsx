import { MessageCircle } from "lucide-react";

// Empty-state only — there's no messaging feature or schema in the app
// today. This exists to make the bottom tab bar's "Chat with Coach"
// destination feel real rather than a dead link, not to imply chat is built.
export default function ChatTab({ coachName }: { coachName: string }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-400" aria-hidden>
        <MessageCircle className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="mt-5 text-xl font-bold text-stone-900">No messages yet</p>
      <p className="mt-2 max-w-[260px] text-base leading-relaxed text-stone-500">
        {coachName} will message you here when they have feedback for you.
      </p>
    </div>
  );
}
