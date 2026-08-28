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
5. **Paddle** — no new merchant account needed. In your existing Paddle dashboard, create a new
   **Product** for CoachLoop with its own price ID(s) ($49–99/mo), separate from any other
   product in the catalog. Put the client-side token and price ID into env vars, and point a
   webhook at `https://<your-domain>/api/webhooks/paddle` for subscription events.
   `app/api/webhooks/paddle/route.ts` has a `TODO` to add signature verification once the webhook
   secret exists — don't skip that before accepting real payments.

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
