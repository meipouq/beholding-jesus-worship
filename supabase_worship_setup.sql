-- =========================================================================
-- BEHOLDING JESUS — WORSHIP TEAM MANAGEMENT PLATFORM
-- COMPLETE SUPABASE DATABASE SETUP & SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS / WORSHIP TEAM MEMBERS
create table if not exists public.team_members (
  id text primary key,
  name text not null,
  email text not null,
  avatar text default '/images/avatar-john-miko.png',
  role_title text default 'Worship Team Member',
  vocal_range text default 'Alto',
  instrument text,
  notes text,
  availability text default 'Available',
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SONG CATEGORIES
create table if not exists public.song_categories (
  id text primary key,
  name text not null unique,
  is_default boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SONGS
create table if not exists public.songs (
  id text primary key,
  title text not null,
  artist text not null,
  composer text,
  genre text,
  category text not null default 'Joyful',
  original_key text not null default 'G',
  tempo_bpm int,
  time_signature text default '4/4',
  youtube_url text,
  spotify_url text,
  lyrics text,
  chords text,
  song_notes text,
  vocal_keys jsonb default '{}'::jsonb,
  created_by text not null,
  updated_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. VOCALISTS & VOCAL KEYS (Relational lookup table)
create table if not exists public.vocalist_song_keys (
  id uuid primary key default uuid_generate_v4(),
  vocalist_id text references public.team_members(id) on delete cascade,
  song_id text references public.songs(id) on delete cascade,
  vocal_key text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(vocalist_id, song_id)
);

-- 5. SERVICE LINEUPS
create table if not exists public.service_lineups (
  id text primary key,
  title text not null,
  service_date date not null,
  service_time text not null default '9:00 AM',
  worship_leader_id text references public.team_members(id),
  worship_leader_name text not null,
  assigned_vocalists jsonb default '[]'::jsonb,
  assigned_musicians jsonb default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  theme text,
  notes text,
  songs jsonb default '[]'::jsonb,
  history jsonb default '[]'::jsonb,
  created_by text not null,
  updated_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REHEARSALS & CALENDAR
create table if not exists public.rehearsals (
  id text primary key,
  title text not null,
  type text not null default 'Worship Rehearsal',
  date date not null,
  start_time text not null,
  end_time text not null,
  venue text not null default 'Main Sanctuary',
  prep_notes text,
  lineup_id text references public.service_lineups(id) on delete set null,
  participants jsonb default '[]'::jsonb,
  created_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TASKS & ASSIGNMENTS
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text,
  assigned_to_id text references public.team_members(id),
  assigned_to_name text not null,
  due_date date not null,
  priority text default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed')),
  notes text,
  created_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ANNOUNCEMENTS
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  author_id text references public.team_members(id),
  author_name text not null,
  author_avatar text,
  is_pinned boolean default false,
  is_important boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. CONVERSATIONS & CHAT
create table if not exists public.conversations (
  id text primary key,
  name text not null,
  is_direct boolean default false,
  channel_type text default 'general',
  description text,
  participant_ids jsonb default '[]'::jsonb,
  last_message text,
  last_message_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. CHAT MESSAGES
create table if not exists public.messages (
  id text primary key,
  conversation_id text references public.conversations(id) on delete cascade,
  sender_id text references public.team_members(id),
  sender_name text not null,
  sender_avatar text,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  reply_to jsonb,
  reactions jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. NOTIFICATIONS
create table if not exists public.notifications (
  id text primary key,
  title text not null,
  message text not null,
  type text not null default 'lineup',
  link_module text,
  is_read boolean default false,
  created_at text default 'Just now'
);

-- Enable Row Level Security
alter table public.team_members enable row level security;
alter table public.song_categories enable row level security;
alter table public.songs enable row level security;
alter table public.vocalist_song_keys enable row level security;
alter table public.service_lineups enable row level security;
alter table public.rehearsals enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Open Collaborative Team Access Policies (Idempotent: drops if already exists)
drop policy if exists "Allow all on team_members" on public.team_members;
create policy "Allow all on team_members" on public.team_members for all using (true) with check (true);

drop policy if exists "Allow all on song_categories" on public.song_categories;
create policy "Allow all on song_categories" on public.song_categories for all using (true) with check (true);

drop policy if exists "Allow all on songs" on public.songs;
create policy "Allow all on songs" on public.songs for all using (true) with check (true);

drop policy if exists "Allow all on vocalist_song_keys" on public.vocalist_song_keys;
create policy "Allow all on vocalist_song_keys" on public.vocalist_song_keys for all using (true) with check (true);

drop policy if exists "Allow all on service_lineups" on public.service_lineups;
create policy "Allow all on service_lineups" on public.service_lineups for all using (true) with check (true);

drop policy if exists "Allow all on rehearsals" on public.rehearsals;
create policy "Allow all on rehearsals" on public.rehearsals for all using (true) with check (true);

drop policy if exists "Allow all on tasks" on public.tasks;
create policy "Allow all on tasks" on public.tasks for all using (true) with check (true);

drop policy if exists "Allow all on announcements" on public.announcements;
create policy "Allow all on announcements" on public.announcements for all using (true) with check (true);

drop policy if exists "Allow all on conversations" on public.conversations;
create policy "Allow all on conversations" on public.conversations for all using (true) with check (true);

drop policy if exists "Allow all on messages" on public.messages;
create policy "Allow all on messages" on public.messages for all using (true) with check (true);

drop policy if exists "Allow all on notifications" on public.notifications;
create policy "Allow all on notifications" on public.notifications for all using (true) with check (true);

-- Enable Supabase Realtime for live team sync (Safe / Idempotent)
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['team_members', 'songs', 'service_lineups', 'rehearsals', 'tasks', 'announcements', 'messages'])
  loop
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;
