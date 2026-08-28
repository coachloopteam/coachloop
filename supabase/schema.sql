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
  paddle_customer_id text,
  paddle_subscription_id text,
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','canceled')),
  created_at timestamptz not null default now()
);

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
