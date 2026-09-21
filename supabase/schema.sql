-- Libria Supabase schema - Postgres adaptation of libria/db.py SCHEMA
-- Run in Supabase SQL Editor. Idempotent.

-- Tracks: keyed by normalized Spotify ID, nullable local_file_path for Supabase Storage
create table if not exists public.tracks (
    track_id text primary key,
    title text not null default '',
    artist text not null default '',
    album text,
    year integer,
    duration_ms integer,
    spotify_url text,
    artwork_url text,
    lyrics text,
    local_file_path text
);

create table if not exists public.favorites (
    track_id text primary key references public.tracks(track_id) on delete cascade
);

create table if not exists public.collections (
    collection_id bigserial primary key,
    name text not null,
    type text not null check (type in ('album', 'playlist', 'genre_mix')),
    created_at timestamptz not null default now()
);

create table if not exists public.collection_tracks (
    collection_id bigint not null references public.collections(collection_id) on delete cascade,
    track_id text not null references public.tracks(track_id) on delete cascade,
    position integer,
    primary key (collection_id, track_id)
);

create table if not exists public.app_settings (
    key text primary key,
    value text
);

-- Seed runtime-critical config (libria/db.py SEED_SETTINGS)
insert into public.app_settings (key, value) values
    ('SPOTIFY_CLIENT_ID', ''),
    ('SPOTIFY_CLIENT_SECRET', ''),
    ('SPOTIFY_ACCESS_TOKEN', ''),
    ('SPOTIFY_REFRESH_TOKEN', ''),
    ('download_directory', ''),
    ('audio_quality', '320kbps'),
    ('explicit_content_allowed', 'true'),
    ('auto_play_enabled', 'true'),
    ('dark_mode', 'true')
on conflict (key) do nothing;

-- Enable RLS but allow service_role full access (Vercel serverless uses service_role)
alter table public.tracks enable row level security;
alter table public.favorites enable row level security;
alter table public.collections enable row level security;
alter table public.collection_tracks enable row level security;
alter table public.app_settings enable row level security;

-- Policies: allow anon read, service_role all (you can tighten to auth.uid() later)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all for service_role tracks') then
    create policy "Allow all for service_role tracks" on public.tracks for all to service_role using (true) with check (true);
    create policy "Allow anon read tracks" on public.tracks for select to anon using (true);
    create policy "Allow anon all tracks" on public.tracks for all to anon using (true) with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all favorites') then
    create policy "Allow all favorites" on public.favorites for all to anon, service_role using (true) with check (true);
    create policy "Allow all collections" on public.collections for all to anon, service_role using (true) with check (true);
    create policy "Allow all collection_tracks" on public.collection_tracks for all to anon, service_role using (true) with check (true);
    create policy "Allow all app_settings" on public.app_settings for all to anon, service_role using (true) with check (true);
  end if;
end $$;

-- Storage bucket for archived audio (optional, replaces local_file_path filesystem)
insert into storage.buckets (id, name, public) values ('libria-audio', 'libria-audio', true) on conflict (id) do nothing;
create policy "Public read libria-audio" on storage.objects for select to anon using (bucket_id = 'libria-audio');
create policy "Allow anon upload libria-audio" on storage.objects for insert to anon, service_role with check (bucket_id = 'libria-audio');
