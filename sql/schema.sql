-- 江湖藏書閣 2.0 schema
-- 在 Supabase SQL Editor 以管理者身分執行。
-- 管理員角色只能由可信任的 Supabase 管理者在 profiles 表設定，不能讓會員自行升級。

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'reader' check (role in ('reader','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete restrict,
  title text not null,
  description text not null default '',
  category text not null default '武俠小說',
  cover_style text not null default 'jade' check (cover_style in ('jade','red','blue','gold')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  title text not null,
  chapter_number integer not null check (chapter_number > 0),
  content text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(book_id, chapter_number)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, book_id)
);

create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key(user_id, book_id)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'reader'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at before update on public.books
for each row execute procedure public.set_updated_at();

drop trigger if exists chapters_set_updated_at on public.chapters;
create trigger chapters_set_updated_at before update on public.chapters
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.favorites enable row level security;
alter table public.reading_progress enable row level security;

-- Profiles: users can see/update only their own non-role fields.
drop policy if exists "profiles select own or admin" on public.profiles;
create policy "profiles select own or admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles update own display name" on public.profiles;
create policy "profiles update own display name" on public.profiles for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

-- Prevent role escalation via direct profile updates by granting column-specific update.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

-- Public may read author metadata; only admins write it.
drop policy if exists "authors public read" on public.authors;
create policy "authors public read" on public.authors for select to anon, authenticated using (true);
drop policy if exists "authors admin insert" on public.authors;
create policy "authors admin insert" on public.authors for insert to authenticated with check (public.is_admin());
drop policy if exists "authors admin update" on public.authors;
create policy "authors admin update" on public.authors for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "authors admin delete" on public.authors;
create policy "authors admin delete" on public.authors for delete to authenticated using (public.is_admin());

-- Public can only read published books and chapters.
drop policy if exists "books published read" on public.books;
create policy "books published read" on public.books for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "books admin insert" on public.books;
create policy "books admin insert" on public.books for insert to authenticated with check (public.is_admin());
drop policy if exists "books admin update" on public.books;
create policy "books admin update" on public.books for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "books admin delete" on public.books;
create policy "books admin delete" on public.books for delete to authenticated using (public.is_admin());

drop policy if exists "chapters published read" on public.chapters;
create policy "chapters published read" on public.chapters for select to anon, authenticated
using (
  (is_published and exists (
    select 1 from public.books b where b.id = book_id and b.is_published
  )) or public.is_admin()
);
drop policy if exists "chapters admin insert" on public.chapters;
create policy "chapters admin insert" on public.chapters for insert to authenticated with check (public.is_admin());
drop policy if exists "chapters admin update" on public.chapters;
create policy "chapters admin update" on public.chapters for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "chapters admin delete" on public.chapters;
create policy "chapters admin delete" on public.chapters for delete to authenticated using (public.is_admin());

drop policy if exists "favorites select own" on public.favorites;
create policy "favorites select own" on public.favorites for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "favorites insert own" on public.favorites;
create policy "favorites insert own" on public.favorites for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "favorites delete own" on public.favorites;
create policy "favorites delete own" on public.favorites for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "progress select own" on public.reading_progress;
create policy "progress select own" on public.reading_progress for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "progress insert own" on public.reading_progress;
create policy "progress insert own" on public.reading_progress for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.chapters c where c.id = public.reading_progress.chapter_id and c.book_id = public.reading_progress.book_id
  )
);
drop policy if exists "progress update own" on public.reading_progress;
create policy "progress update own" on public.reading_progress for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.chapters c where c.id = public.reading_progress.chapter_id and c.book_id = public.reading_progress.book_id
  )
);

grant select on public.authors, public.books, public.chapters to anon, authenticated;
grant insert, update, delete on public.authors, public.books, public.chapters to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update on public.reading_progress to authenticated;
