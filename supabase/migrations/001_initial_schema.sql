create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text,
    created_at timestamptz not null default now()
);

alter table public.profiles
    add column if not exists username text;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'display_name'
    ) then
        execute 'update public.profiles p set username = lower(regexp_replace(coalesce(p.username, p.display_name, ''''''), ''[^A-Za-z0-9_]'', '''', ''g'')) where p.username is null';
    end if;
end;
$$;

insert into public.profiles (id, username)
select
    users.id,
    'user_' || substr(replace(users.id::text, '-', ''), 1, 12)
from auth.users users
where not exists (
    select 1 from public.profiles profiles where profiles.id = users.id
);

update public.profiles
set username = 'user_' || substr(replace(id::text, '-', ''), 1, 12)
where username is null or username = '';

alter table public.profiles
    alter column username set not null;

create unique index if not exists profiles_username_key
    on public.profiles (lower(username));

alter table public.profiles
    drop constraint if exists profiles_username_format;
alter table public.profiles
    add constraint profiles_username_format
    check (username ~ '^[A-Za-z0-9_]{3,30}$');

alter table public.profiles enable row level security;

drop policy if exists "Users read profiles" on public.profiles;
create policy "Users read profiles"
on public.profiles for select
using (true);

drop policy if exists "Users manage their profile" on public.profiles;
create policy "Users manage their profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

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

drop function if exists public.handle_new_profile();
create function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    next_username text;
begin
    next_username := lower(regexp_replace(
        coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)),
        '[^A-Za-z0-9_]', '', 'g'
    ));
    if char_length(next_username) < 3 then
        next_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
    end if;

    insert into public.profiles (id, username)
    values (new.id, left(next_username, 30))
    on conflict (id) do update set username = excluded.username;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_profile();

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
