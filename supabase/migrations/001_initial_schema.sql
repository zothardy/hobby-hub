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
        execute $sql$
            update public.profiles p
            set username = lower(regexp_replace(coalesce(p.username, p.display_name, ''), '[^A-Za-z0-9_]', '', 'g'))
            where p.username is null
        $sql$;
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

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_profile();
create function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
    base_username text;
    next_username text;
    suffix integer := 0;
begin
    base_username := lower(regexp_replace(
        coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)),
        '[^A-Za-z0-9_]', '', 'g'
    ));
    if char_length(base_username) < 3 then
        base_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
    end if;

    base_username := left(base_username, 24);
    next_username := base_username;
    while exists (
        select 1 from public.profiles
        where lower(username) = next_username
    ) loop
        suffix := suffix + 1;
        next_username := left(base_username, 24) || '_' || suffix;
    end loop;

    insert into public.profiles (id, username)
    values (new.id, next_username)
    on conflict (id) do update set username = excluded.username;
    return new;
end;
$$;

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

alter table public.profiles add column if not exists is_dev boolean not null default false;
alter table public.profiles add column if not exists global_role text not null default 'hobbyist'
    check (global_role in ('hobbyist', 'mod', 'dev'));
alter table public.hobbies add column if not exists is_public boolean not null default true;
alter table public.hobbies add column if not exists labels text[] not null default '{}';
alter table public.hobbies add column if not exists owner_role text not null default 'admin'
    check (owner_role in ('admin', 'mod', 'hobbyist'));

create index if not exists hobbies_public_browse_idx on public.hobbies (is_public, created_at desc);
drop policy if exists "Public can browse public hobbies" on public.hobbies;
create policy "Public can browse public hobbies"
on public.hobbies for select using (is_public = true);

create table if not exists public.hobby_memberships (
    hobby_id uuid not null references public.hobbies(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'hobbyist' check (role in ('admin', 'mod', 'hobbyist')),
    joined_at timestamptz not null default now(),
    primary key (hobby_id, user_id)
);
alter table public.hobby_memberships enable row level security;

drop policy if exists "Members can read memberships" on public.hobby_memberships;
create policy "Members can read memberships"
on public.hobby_memberships for select using (true);
drop policy if exists "Users join and leave hobbies" on public.hobby_memberships;
create policy "Users join and leave hobbies"
on public.hobby_memberships for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.hobby_threads (
    id uuid primary key default gen_random_uuid(),
    hobby_id uuid not null references public.hobbies(id) on delete cascade,
    author_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(title) between 1 and 160),
    created_at timestamptz not null default now()
);
create table if not exists public.hobby_posts (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references public.hobby_threads(id) on delete cascade,
    author_id uuid not null references auth.users(id) on delete cascade,
    body text not null check (char_length(body) between 1 and 5000),
    created_at timestamptz not null default now()
);
alter table public.hobby_threads enable row level security;
alter table public.hobby_posts enable row level security;

drop policy if exists "Members read hobby threads" on public.hobby_threads;
create policy "Members read hobby threads" on public.hobby_threads for select using (true);
drop policy if exists "Members write hobby threads" on public.hobby_threads;
create policy "Members write hobby threads" on public.hobby_threads for insert
with check (auth.uid() = author_id);
drop policy if exists "Devs remove hobby threads" on public.hobby_threads;
create policy "Devs remove hobby threads" on public.hobby_threads for delete
using (exists (
    select 1 from public.profiles
    where id = auth.uid() and is_dev = true
));
drop policy if exists "Members read hobby posts" on public.hobby_posts;
create policy "Members read hobby posts" on public.hobby_posts for select using (true);
drop policy if exists "Members write hobby posts" on public.hobby_posts;
drop policy if exists "Members write hobby_posts" on public.hobby_posts;
create policy "Members write hobby posts" on public.hobby_posts for insert
with check (auth.uid() = author_id);
drop policy if exists "Devs remove hobby posts" on public.hobby_posts;
create policy "Devs remove hobby posts" on public.hobby_posts for delete
using (exists (
    select 1 from public.profiles
    where id = auth.uid() and is_dev = true
));

alter table public.events add column if not exists rsvp_enabled boolean not null default false;

create or replace function public.get_shared_event(requested_share_id uuid)
returns table (
    share_id uuid,
    title text,
    hobby_title text,
    location text,
    map_query text,
    map_url text,
    starts_at timestamptz,
    image_url text
)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
    select e.share_id, e.title, e.hobby_title, e.location, e.map_query, e.map_url, e.starts_at, e.image_url
    from public.events e
    where e.share_id = requested_share_id
    limit 1;
$$;
revoke all on function public.get_shared_event(uuid) from public;
grant execute on function public.get_shared_event(uuid) to anon, authenticated;

create table if not exists public.event_rsvps (
    event_id uuid not null references public.events(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
    created_at timestamptz not null default now(),
    primary key (event_id, user_id)
);
alter table public.event_rsvps enable row level security;
drop policy if exists "Users manage their RSVPs" on public.event_rsvps;
create policy "Users manage their RSVPs" on public.event_rsvps for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
