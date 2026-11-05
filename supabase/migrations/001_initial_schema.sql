create extension if not exists pgcrypto;

create table if not exists public.hobbies (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text not null,
    image_url text,
    created_at timestamptz not null default now()
);

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    share_id uuid not null unique default gen_random_uuid(),
    hobby_id uuid not null references public.hobbies(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    hobby_title text not null,
    location text not null,
    map_query text not null default '',
    map_url text not null default '',
    starts_at timestamptz,
    image_url text,
    is_public boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.hobbies enable row level security;
alter table public.events enable row level security;

drop policy if exists "Users manage their hobbies" on public.hobbies;
create policy "Users manage their hobbies"
on public.hobbies for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their events" on public.events;
create policy "Users manage their events"
on public.events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Public can read shared events" on public.events;
create policy "Public can read shared events"
on public.events for select
using (is_public = true);
