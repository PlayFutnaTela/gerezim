-- Migration: Add role column to public.profiles
-- Adds an enum type `user_role` (user, adm) and a NOT NULL column `role` with default 'user'

begin;

-- Create enum type if it doesn't already exist (safe to run multiple times)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'adm');
  end if;
end$$;

-- Add the column to the profiles table (if not exists) with default 'user'
alter table public.profiles
  add column if not exists role public.user_role not null default 'user';

-- Ensure legacy rows have a value (defensive; the default should already have filled them)
update public.profiles
set role = 'user'
where role is null;

-- Add an index to make role lookups faster
create index if not exists idx_profiles_role on public.profiles (role);

-- Row Level Security: allow admins (profiles.role = 'adm') to select/update any profile
create policy if not exists "Admins can view any profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'adm'
    )
  );

create policy if not exists "Admins can update any profile"
  on public.profiles for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'adm'
    )
  )
  with check (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'adm'
    )
  );

commit;
