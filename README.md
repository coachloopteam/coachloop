# CoachLoop

AI-assisted client portal for fitness coaches. Coaches invite clients with a link; clients log
meals/workouts as free text and get AI feedback constrained to the coach's own methodology — no
app install, no WhatsApp thread.

## Stack

Next.js 16 (App Router) · Supabase (Postgres + Auth) · Anthropic (Claude Haiku, per-log feedback) ·
Paddle (billing, overlay checkout)

## MVP scope (48-hour cut)

**In:** coach signup, structured methodology form, client invite links, free-text meal/workout
logging, one AI feedback call per log grounded in the coach's methodology, coach dashboard with a
"no activity in 3+ days" flag, Paddle checkout button + webhook stub for subscription status.

**Explicitly cut for v1:** photo-based meal recognition, in-app coach↔client chat, custom
branding/white-label, gamification/streaks, calendar/booking, native mobile (this is a responsive
web app, not a PWA manifest yet).

## One-time account setup

This project is intentionally separated from any other venture's infrastructure — new accounts,
no shared history.

1. **Dedicated email** — create one fresh Gmail address for this venture if you haven't already;
   use it for every signup below so everything traces back to one inbox.
2. **GitHub** — create a new GitHub organization (Settings → “New organization”, free tier) under
   that email, then push this repo to a new repo inside it.
3. **Supabase** — new project at supabase.com (free tier) under that email. Once created:
   - Go to the SQL Editor and run `supabase/schema.sql` from this repo.
   - Go to Project Settings → API and copy the Project URL, `anon` public key, and
     `service_role` key into your env vars (see below). Never expose the service role key to the
     browser — it's only used in `lib/supabase/admin.ts`, server-side.
4. **Vercel** — new project at vercel.com (free Hobby tier) under that email, importing the GitHub
   repo above. Add the env vars from `.env.local.example` in Project Settings → Environment
   Variables before the first real deploy.
5. **Paddle sandbox setup** — no new merchant account needed; this uses your existing Paddle
   account's built-in **Sandbox** (switch to it via the environment toggle at the top of the
   Paddle dashboard). All the code below is already wired up and waiting on real values —
   there's nothing left to build, just values to create and drop into env vars.

   1. **Product + Price** — Catalog > Products > New product, name it (e.g. "CoachLoop Pro"),
      then add a recurring Price ($49–99/mo). Copy the Price ID (`pri_...`) into
      `NEXT_PUBLIC_PADDLE_PRICE_ID`.
   2. **Client-side token** — Developer tools > Authentication > Client-side tokens > New
      token. Copy it into `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (sandbox tokens are safe to expose to
      the browser — that's what they're for; never put an API key here).
   3. **Webhook / notification destination** — Developer tools > Notifications > New
      destination. URL: `https://<your-vercel-domain>/api/webhooks/paddle`. Type: Webhook. Events:
      at minimum `subscription.created`, `subscription.updated`, `subscription.activated`,
      `subscription.trialing`, `subscription.past_due`, `subscription.paused`,
      `subscription.canceled`. After saving, open the destination and copy its **signing secret**
      (`ntfset_...` secret, shown once — regenerating it invalidates the old one) into
      `PADDLE_WEBHOOK_SECRET`.
   4. Leave `PADDLE_API_KEY` blank for now — the webhook handler verifies signatures using
      `PADDLE_WEBHOOK_SECRET` alone; the API key slot exists for future server-side Paddle calls
      this app doesn't make yet.
   5. Redeploy (or restart `next dev`) after setting the env vars so Next.js picks up the new
      `NEXT_PUBLIC_*` values — they're inlined at build time, not read at request time.

   How the pieces fit together: `components/PricingCards.tsx` (on `/coach/pricing`) opens Paddle's
   checkout overlay and tags the transaction with `customData: { coach_id }`, so
   `app/api/webhooks/paddle/route.ts`
   can find the right `coaches` row the moment Paddle confirms payment — before that coach has
   ever been assigned a `paddle_customer_id`. The webhook verifies every request's
   `Paddle-Signature` header against `PADDLE_WEBHOOK_SECRET` via `@paddle/paddle-node-sdk` and
   rejects anything that doesn't match, then syncs `coaches.subscription_status` directly from
   Paddle's own subscription status (trialing/active/past_due/paused→canceled/canceled) — so it
   stays correct through renewals, dunning, and cancellations without needing special-case logic
   per event type.

   This is sandbox-only: test cards and fake billing details, nothing real is charged. Going live
   later means Paddle's own "Verify your account" and "Test and go live" steps, plus creating the
   equivalent Product/Price/token/webhook in Paddle's **live** environment (sandbox and live are
   entirely separate catalogs — nothing here carries over automatically).

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

Open http://localhost:3000 — `/coach/login` to create a coach account, `/coach` for the
dashboard, `/coach/methodology` to set the AI's guardrails, and the generated `/c/<token>` link
for the client-facing portal.

## Data model

See `supabase/schema.sql`. Coaches authenticate via Supabase Auth and are protected by Row Level
Security. Clients have no Supabase Auth session for v1 — their invite token in the URL is the
credential, validated server-side in `app/api/log/route.ts` against the service-role client, which
is the only thing allowed to bypass RLS.
