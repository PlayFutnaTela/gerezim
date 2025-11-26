-- Create enum type for user roles (safe if run multiple times)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'adm');
  end if;
end$$;

-- Cria a tabela de perfis
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  -- Role column (defaults to 'user'). Use an enum for stricter values.
  -- Possible values: 'user' (regular user), 'adm' (admin)
  role public.user_role default 'user' not null,
  bio text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  primary key (id),
  constraint username_length check (char_length(full_name) >= 3)
);

-- Habilita Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Cria políticas de segurança
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
-- Helper function to check admin status in a safe, non-recursive way
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'is_admin' and pronamespace = 'public'::regnamespace
  ) then
    create function public.is_admin(uid uuid) returns boolean language sql security definer as $fn$
      select exists(select 1 from public.profiles p where p.id = $1 and p.role = 'adm');
    $fn$;
  end if;
end$$;

-- Admin policies: allow users with profiles.role = 'adm' (checked via public.is_admin()) to view/update any profile
create policy "Admins can view any profile."
  on profiles for select
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

create policy "Admins can update any profile."
  on profiles for update
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

-- Cria bucket de storage para avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Políticas de storage
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );
