-- CoachLoop schema v2 (PROPOSED / DRAFT — NOT APPLIED)
--
-- Extends supabase/schema.sql to support: richer coach/client profiles,
-- a real coach<->client assignment history (leads, active, paused, ended),
-- dual-sided gamification (client streak/XP, coach retention/achievements),
-- and a catalog-backed workout/recipe/daily-log system.
--
-- This file is a review draft only. Apply it against a Supabase branch or
-- staging project first, never directly against production — several
-- statements here (see "MIGRATION NOTE" below) change existing constraints.
--
-- Two deliberate departures from what was asked, kept consistent with this
-- app's actual architecture:
--
-- 1. No unified `profiles` table. coaches/clients already exist as two
--    separate tables, and most clients never get an auth.users row at all
--    (the whole product is built around tokenless client access via
--    /c/[token] — zero signup). A profiles table keyed 1:1 to auth.users
--    would silently exclude that entire client population, so the new
--    fields are added directly onto `coaches` and `clients` instead.
--
-- 2. `clients.coach_id` moves from NOT NULL to nullable (see MIGRATION NOTE
--    below) so a client can exist as an unassigned "lead" before any coach
--    owns them. Today every client row is created BY a specific coach's
--    invite, so this is a real behavioral change, not just an additive one.

-- ============================================================================
-- 1. DUAL-ROLE USER ARCHITECTURE — extends coaches / clients
-- ============================================================================

-- Coach-side additions
alter table coaches add column if not exists bio text default '';
alter table coaches add column if not exists specialties text[] not null default '{}'
  check (specialties <@ array['fitness','pilates','yoga']::text[]);
alter table coaches add column if not exists pricing_tier text not null default '$$'
  check (pricing_tier in ('$','$$','$$$'));
-- training_philosophy already covers "philosophy text"; subscription_status
-- already covers Paddle status — not duplicated here.

create index if not exists coaches_specialties_gin_idx on coaches using gin(specialties);
create index if not exists coaches_pricing_tier_idx on coaches(pricing_tier);

-- Client-side additions
alter table clients add column if not exists fitness_goals text[] not null default '{}';
alter table clients add column if not exists gluten_free boolean not null default false;
alter table clients add column if not exists lactose_free boolean not null default false;

-- No new `role` column: raw_user_meta_data->>'role' on auth.users already
-- drives the coach/client fork in handle_new_coach() (see schema.sql).

-- ============================================================================
-- 2. MARKETPLACE & MATCHING — coach_client_assignments
-- ============================================================================

-- MIGRATION NOTE: relaxes clients.coach_id from NOT NULL to nullable — a
-- client can now exist as an unassigned lead before any coach owns them.
-- Every existing row already has a coach_id, so this is safe to run as-is,
-- but any code path that assumed coach_id is always present must be
-- reviewed (app/coach/page.tsx, RLS policies below, etc.).
alter table clients alter column coach_id drop not null;

create table if not exists coach_client_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  status text not null default 'lead'
    check (status in ('lead','active','paused','ended')),
  origin text not null default 'direct_invite'
    check (origin in ('direct_invite','coach_finder','referral','other')),
  start_date date,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_client_assignments_coach_id_idx on coach_client_assignments(coach_id);
create index if not exists coach_client_assignments_client_id_idx on coach_client_assignments(client_id);
create index if not exists coach_client_assignments_status_idx on coach_client_assignments(status);

-- A client can only have one *active* coach at a time — history (lead,
-- paused, ended rows) can pile up freely, this just guards the live state.
create unique index if not exists coach_client_assignments_one_active_per_client
  on coach_client_assignments(client_id) where status = 'active';

-- Keeps the denormalized clients.coach_id pointer (used everywhere today —
-- app/coach/page.tsx, RLS policies, etc.) in sync with whichever assignment
-- is currently 'active', so none of the existing queries need to change.
create or replace function public.sync_client_current_coach()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    update clients set coach_id = new.coach_id where id = new.client_id;
  end if;
  return new;
end;
$$;

create trigger on_assignment_activated
  after insert or update of status on coach_client_assignments
  for each row execute function sync_client_current_coach();

-- ============================================================================
-- 3. DUAL-SIDED GAMIFICATION
-- ============================================================================

create table if not exists client_gamification (
  client_id uuid primary key references clients(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  max_streak integer not null default 0 check (max_streak >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists coach_gamification (
  coach_id uuid primary key references coaches(id) on delete cascade,
  client_retention_rate numeric(5,2) not null default 0
    check (client_retention_rate between 0 and 100),
  total_checkins_completed integer not null default 0 check (total_checkins_completed >= 0),
  unlocked_achievements jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- client_retention_rate is an aggregate over `clients`, not something a
-- single-row trigger can own — recomputed by this function whenever a
-- client's status changes. Mirrors the activated/retained math already
-- live in app/coach/page.tsx (retentionRate calculation).
create or replace function public.recompute_coach_retention(p_coach_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  activated int;
  retained int;
begin
  if p_coach_id is null then
    return;
  end if;

  select count(*) into activated from clients where coach_id = p_coach_id and status <> 'invited';
  select count(*) into retained from clients where coach_id = p_coach_id and status = 'active';

  insert into coach_gamification (coach_id, client_retention_rate, updated_at)
  values (p_coach_id, case when activated > 0 then round(100.0 * retained / activated, 2) else 0 end, now())
  on conflict (coach_id) do update
    set client_retention_rate = excluded.client_retention_rate, updated_at = now();
end;
$$;

create or replace function public.handle_client_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_coach_retention(coalesce(new.coach_id, old.coach_id));
  return coalesce(new, old);
end;
$$;

create trigger on_client_status_change
  after insert or update of status or delete on clients
  for each row execute function handle_client_status_change();

-- ============================================================================
-- 4. ACTIVITY / NUTRITION / MEDIA VAULTS + daily_logs
-- ============================================================================

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id) on delete cascade, -- null = shared/global library item
  title text not null,
  discipline_type text not null check (discipline_type in ('fitness','pilates','yoga')),
  detail text,
  duration_minutes integer check (duration_minutes > 0),
  instruction_steps jsonb not null default '[]'::jsonb,
  video_url text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id) on delete cascade,
  title text not null,
  description text,
  calories integer check (calories >= 0),
  image_url text,
  ingredients jsonb not null default '[]'::jsonb,
  high_calorie boolean not null default false,
  nutrient_dense boolean not null default false,
  gluten_free boolean not null default false,
  lactose_free boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists workouts_coach_id_idx on workouts(coach_id);
create index if not exists workouts_discipline_type_idx on workouts(discipline_type);
create index if not exists recipes_coach_id_idx on recipes(coach_id);

-- Deliberately separate from the existing `logs` table: `logs` is free-text
-- meal/workout notes feeding the live AI-feedback pipeline (app/api/log);
-- `daily_logs` is structured completions of catalog workouts/recipes that
-- drive XP/streak. Collapsing them would risk the AI-feedback flow.
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  workout_id uuid references workouts(id) on delete set null,
  recipe_id uuid references recipes(id) on delete set null,
  log_date date not null default current_date,
  xp_earned integer not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now(),
  check (workout_id is not null or recipe_id is not null)
);

create index if not exists daily_logs_client_id_idx on daily_logs(client_id);
create index if not exists daily_logs_log_date_idx on daily_logs(log_date desc);
-- One workout completion per client per day (recipes can repeat — "viewed
-- a meal idea" isn't exclusive the way "did today's workout" is).
create unique index if not exists daily_logs_client_workout_per_day_idx
  on daily_logs(client_id, workout_id, log_date) where workout_id is not null;

-- Streak/XP trigger. Streak math is date-based (consecutive calendar days),
-- not timestamp-based, since two logs on the same day must not double-count.
create or replace function public.handle_daily_log_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  last_date date;
begin
  insert into client_gamification (client_id) values (new.client_id)
  on conflict (client_id) do nothing;

  select (last_activity_at at time zone 'utc')::date into last_date
  from client_gamification where client_id = new.client_id;

  update client_gamification
  set
    total_xp = total_xp + new.xp_earned,
    current_streak = case
      when last_date is null then 1
      when new.log_date = last_date then current_streak
      when new.log_date = last_date + 1 then current_streak + 1
      when new.log_date > last_date + 1 then 1
      else current_streak -- backdated log: don't disturb the streak
    end,
    max_streak = greatest(max_streak, case
      when last_date is null then 1
      when new.log_date = last_date + 1 then current_streak + 1
      else max_streak
    end),
    last_activity_at = greatest(coalesce(last_activity_at, new.log_date::timestamptz), new.log_date::timestamptz),
    updated_at = now()
  where client_id = new.client_id;

  return new;
end;
$$;

create trigger on_daily_log_insert
  after insert on daily_logs
  for each row execute function handle_daily_log_gamification();

-- Feeds the coach's "Active Check-ins Completed Today" counter.
create or replace function public.handle_checkin_for_coach()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into coach_gamification (coach_id)
  select coach_id from clients where id = new.client_id and coach_id is not null
  on conflict (coach_id) do nothing;

  update coach_gamification cg
  set total_checkins_completed = total_checkins_completed + 1, updated_at = now()
  from clients c
  where c.id = new.client_id and cg.coach_id = c.coach_id;

  return new;
end;
$$;

create trigger on_daily_log_insert_coach_stats
  after insert on daily_logs
  for each row execute function handle_checkin_for_coach();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table coach_client_assignments enable row level security;
alter table client_gamification enable row level security;
alter table coach_gamification enable row level security;
alter table workouts enable row level security;
alter table recipes enable row level security;
alter table daily_logs enable row level security;

-- Coaches manage their own assignment history and content library.
create policy "coach manages own assignments" on coach_client_assignments
  for all using (coach_id in (select id from coaches where auth_user_id = auth.uid()))
  with check (coach_id in (select id from coaches where auth_user_id = auth.uid()));

create policy "coach manages own workouts" on workouts
  for all using (coach_id in (select id from coaches where auth_user_id = auth.uid()))
  with check (coach_id in (select id from coaches where auth_user_id = auth.uid()));

create policy "coach manages own recipes" on recipes
  for all using (coach_id in (select id from coaches where auth_user_id = auth.uid()))
  with check (coach_id in (select id from coaches where auth_user_id = auth.uid()));

create policy "coach reads own gamification" on coach_gamification
  for select using (coach_id in (select id from coaches where auth_user_id = auth.uid()));

-- Clients (the ones with an optional auth account) see only their own
-- content and their assigned coach's library — never another coach's.
create policy "client reads assigned coach workouts" on workouts
  for select using (
    coach_id is null -- global library
    or coach_id in (select coach_id from clients where auth_user_id = auth.uid())
  );

create policy "client reads assigned coach recipes" on recipes
  for select using (
    coach_id is null
    or coach_id in (select coach_id from clients where auth_user_id = auth.uid())
  );

create policy "client reads own daily logs" on daily_logs
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));

create policy "client inserts own daily logs" on daily_logs
  for insert with check (client_id in (select id from clients where auth_user_id = auth.uid()));

create policy "client reads own gamification" on client_gamification
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));

-- Coaches read (never write) their clients' logs and gamification state —
-- same join pattern the existing logs/ai_feedback policies already use.
create policy "coach reads own clients daily logs" on daily_logs
  for select using (
    client_id in (select c.id from clients c join coaches co on co.id = c.coach_id where co.auth_user_id = auth.uid())
  );

create policy "coach reads own clients gamification" on client_gamification
  for select using (
    client_id in (select c.id from clients c join coaches co on co.id = c.coach_id where co.auth_user_id = auth.uid())
  );

-- NOTE: client_gamification / coach_gamification intentionally have no
-- client-facing INSERT/UPDATE policy — they're only ever written by the
-- security-definer triggers above, so a client can never forge their own
-- XP or streak.
--
-- NOTE: tokenless clients (no auth.users row — the majority) never touch
-- these RLS policies at all. Their daily_logs inserts go through a
-- service-role API route after validating invite_token, exactly like the
-- existing `logs` table today (see app/api/log/route.ts).
