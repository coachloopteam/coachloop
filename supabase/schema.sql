-- CoachLoop MVP schema
-- Run this in the Supabase SQL editor of your NEW project (separate from AvalonLabs).

create extension if not exists "pgcrypto";

-- One row per coach. auth_user_id ties back to Supabase Auth (coaches log in for real).
create table if not exists coaches (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  business_name text,
  -- Structured methodology so the AI prompt stays reliable instead of free-text drift.
  training_philosophy text default '',
  nutrition_rules text default '',
  tone text default 'supportive, direct, no fluff',
  banned_topics text default '',
  -- How many days of silence before a client shows up under "Needs Your
  -- Attention" on the coach dashboard (app/coach/page.tsx). Configurable via
  -- the methodology screen — this is the one "toggle" from that screen with
  -- a real, already-built effect to attach to; see components/MethodologyForm.tsx.
  stale_after_days integer not null default 3 check (stale_after_days > 0),
  paddle_customer_id text,
  paddle_subscription_id text,
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','canceled')),
  created_at timestamptz not null default now()
);

-- Auto-creates the coaches row the moment someone signs up via Supabase Auth
-- (see app/coach/login/page.tsx) — runs with elevated privileges so it isn't
-- blocked by the "coach updates own row" RLS policy below, which wouldn't
-- apply yet anyway since there's no coaches row to match auth.uid() against
-- until this runs. Applied directly against the live project; captured here
-- for the record.
create or replace function public.handle_new_coach()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.coaches (auth_user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_coach();

-- One row per client. Clients do NOT get a Supabase Auth account for the MVP —
-- they're identified by an unguessable invite_token in their portal URL
-- (/c/<invite_token>), so onboarding is "open the link", not "create a password".
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  name text not null,
  email text,
  invite_token text not null unique,
  status text not null default 'invited'
    check (status in ('invited','active','paused')),
  created_at timestamptz not null default now()
);

create index if not exists clients_coach_id_idx on clients(coach_id);
create index if not exists clients_invite_token_idx on clients(invite_token);

-- Every meal/workout entry a client submits.
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('meal','workout')),
  content text not null,
  photo_url text,
  logged_at timestamptz not null default now()
);

create index if not exists logs_client_id_idx on logs(client_id);
create index if not exists logs_logged_at_idx on logs(logged_at desc);

-- The AI's response to a given log, shown back to the client and visible to the coach.
create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references logs(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  feedback text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_feedback_client_id_idx on ai_feedback(client_id);

-- Row Level Security: coaches can only ever see their own data via Supabase Auth.
-- Clients have no Supabase Auth session, so client-facing reads/writes go through
-- the /api routes using the service role key (server-side only, never exposed to
-- the browser) after validating the invite_token — not through direct table access.
alter table coaches enable row level security;
alter table clients enable row level security;
alter table logs enable row level security;
alter table ai_feedback enable row level security;

create policy "coach reads own row" on coaches
  for select using (auth.uid() = auth_user_id);

create policy "coach updates own row" on coaches
  for update using (auth.uid() = auth_user_id);

create policy "coach reads own clients" on clients
  for select using (
    coach_id in (select id from coaches where auth_user_id = auth.uid())
  );

create policy "coach reads own clients logs" on logs
  for select using (
    client_id in (
      select c.id from clients c
      join coaches co on co.id = c.coach_id
      where co.auth_user_id = auth.uid()
    )
  );

create policy "coach reads own clients feedback" on ai_feedback
  for select using (
    client_id in (
      select c.id from clients c
      join coaches co on co.id = c.coach_id
      where co.auth_user_id = auth.uid()
    )
  );

-- Mirrors Paddle customer/subscription/transaction state from verified
-- webhook events (see app/api/webhooks/paddle/route.ts and
-- lib/paddle/process-webhook.ts). Written only by the webhook handler via
-- the service-role client — coaches read their own rows through RLS below.

create table if not exists customers (
  customer_id text primary key,
  -- Nullable: a subscription event can arrive before the customer.created
  -- event that would otherwise set this, so the webhook handler upserts a
  -- stub row first. Backfilled from custom_data.coach_id on subscription
  -- events; email is backfilled separately from customer.created/updated.
  coach_id uuid references coaches(id) on delete set null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_coach_id_idx on customers(coach_id);
create index if not exists customers_email_idx on customers(email);

create table if not exists subscriptions (
  subscription_id text primary key,
  customer_id text not null references customers(customer_id) on delete cascade,
  status text not null,
  price_id text not null,
  product_id text not null,
  -- Non-null while a cancel/pause/resume is pending but hasn't taken effect
  -- yet. `status` stays 'active' until then — see lib/paddle/access.ts.
  scheduled_change_action text,
  scheduled_change_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_id_idx on subscriptions(customer_id);
create index if not exists subscriptions_status_idx on subscriptions(status);

-- Transaction totals arrive from Paddle as decimal strings in the currency's
-- lowest unit (e.g. "4900" = $49.00) — stored as text, not parsed here.
create table if not exists transactions (
  transaction_id text primary key,
  customer_id text references customers(customer_id) on delete set null,
  subscription_id text references subscriptions(subscription_id) on delete set null,
  status text not null,
  currency_code text,
  total_amount text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_customer_id_idx on transactions(customer_id);

alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table transactions enable row level security;

create policy "coach reads own customer row" on customers
  for select using (
    coach_id in (select id from coaches where auth_user_id = auth.uid())
  );

create policy "coach reads own subscriptions" on subscriptions
  for select using (
    customer_id in (
      select customer_id from customers
      where coach_id in (select id from coaches where auth_user_id = auth.uid())
    )
  );

create policy "coach reads own transactions" on transactions
  for select using (
    customer_id in (
      select customer_id from customers
      where coach_id in (select id from coaches where auth_user_id = auth.uid())
    )
  );
