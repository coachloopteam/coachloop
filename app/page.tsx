import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-semibold">CoachLoop</h1>
        <p className="text-neutral-600">
          Your clients log meals and workouts, and get feedback in your voice — without another
          WhatsApp thread.
        </p>
        <Link
          href="/coach/login"
          className="inline-block bg-neutral-900 text-white rounded-lg px-5 py-2.5 font-medium"
        >
          Coach sign in / sign up
        </Link>
      </div>
    </div>
  );
}
