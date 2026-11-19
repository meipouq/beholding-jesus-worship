-- =========================================================================
-- BEHOLDING JESUS WORSHIP TEAM — WEB PUSH NOTIFICATIONS & DEDUPLICATION SCHEMA
-- Migrations for push subscriptions, atomic deduplication, and durable rate limiting
-- =========================================================================

-- Enable uuid extension if not present
create extension if not exists "uuid-ossp";

-- 1. PUSH SUBSCRIPTIONS TABLE
-- Stores browser and device push registration credentials per team member
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  platform text default 'web',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, endpoint)
);

-- Enable Row Level Security on push_subscriptions
alter table public.push_subscriptions enable row level security;

-- Strict ownership RLS policies: members can ONLY manage their own device subscriptions
drop policy if exists "push_subs_select_own" on public.push_subscriptions;
create policy "push_subs_select_own" on public.push_subscriptions
  for select
  using (
    auth.uid()::text = user_id 
    or current_setting('request.jwt.claim.sub', true) = user_id
    or user_id = current_user
  );

drop policy if exists "push_subs_insert_own" on public.push_subscriptions;
create policy "push_subs_insert_own" on public.push_subscriptions
  for insert
  with check (
    auth.uid()::text = user_id 
    or current_setting('request.jwt.claim.sub', true) = user_id
    or user_id = current_user
  );

drop policy if exists "push_subs_update_own" on public.push_subscriptions;
create policy "push_subs_update_own" on public.push_subscriptions
  for update
  using (
    auth.uid()::text = user_id 
    or current_setting('request.jwt.claim.sub', true) = user_id
    or user_id = current_user
  );

drop policy if exists "push_subs_delete_own" on public.push_subscriptions;
create policy "push_subs_delete_own" on public.push_subscriptions
  for delete
  using (
    auth.uid()::text = user_id 
    or current_setting('request.jwt.claim.sub', true) = user_id
    or user_id = current_user
  );


-- 2. NOTIFICATIONS_SENT (ATOMIC DEDUPLICATION TABLE)
-- Strictly server-side table used by Edge Function to guarantee at-most-once delivery
create table if not exists public.notifications_sent (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  notification_id text not null,
  category text,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, notification_id)
);

-- Enable RLS: NO policies are granted to anon or authenticated clients.
-- Only the service_role key has access to insert/select/delete deduplication records.
alter table public.notifications_sent enable row level security;

-- Revoke all direct permissions from public/anon/authenticated roles
revoke all on public.notifications_sent from anon, authenticated;


-- 3. PUSH_RATE_LIMITS (DURABLE ATOMIC RATE LIMITING TABLE)
-- Tracks rolling 60-second dispatch rate per user across Edge Function instances
create table if not exists public.push_rate_limits (
  user_id text primary key,
  window_start timestamp with time zone default timezone('utc'::text, now()) not null,
  count int not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS: Strictly server-side / service_role only.
alter table public.push_rate_limits enable row level security;
revoke all on public.push_rate_limits from anon, authenticated;


-- 4. ATOMIC RATE LIMIT & DEDUPLICATION STORED PROCEDURE
-- Atomically checks duplicate status & rate limit under concurrency with row-level locks
create or replace function public.check_and_record_push(
  p_user_id text,
  p_notification_id text,
  p_category text,
  p_max_per_minute int default 5
)
returns table(allowed boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamp with time zone := clock_timestamp();
  v_window_start timestamp with time zone;
  v_count int;
begin
  -- 1. Check duplicate atomically via notifications_sent
  if exists (select 1 from public.notifications_sent where user_id = p_user_id and notification_id = p_notification_id) then
    return query select false, 'duplicate';
    return;
  end if;

  -- 2. Durable atomic rate limit check & increment with row locking (SELECT ... FOR UPDATE)
  select window_start, count into v_window_start, v_count
  from public.push_rate_limits
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.push_rate_limits (user_id, window_start, count, updated_at)
    values (p_user_id, v_now, 1, v_now);
  else
    if (v_now - v_window_start) > interval '1 minute' then
      update public.push_rate_limits
      set window_start = v_now, count = 1, updated_at = v_now
      where user_id = p_user_id;
    else
      if v_count >= p_max_per_minute then
        return query select false, 'rate_limited';
        return;
      end if;
      update public.push_rate_limits
      set count = v_count + 1, updated_at = v_now
      where user_id = p_user_id;
    end if;
  end if;

  -- 3. Record notification as sent atomically
  begin
    insert into public.notifications_sent (user_id, notification_id, category, sent_at)
    values (p_user_id, p_notification_id, p_category, v_now);
  exception when unique_violation then
    return query select false, 'duplicate';
    return;
  end;

  return query select true, 'ok';
end;
$$;
