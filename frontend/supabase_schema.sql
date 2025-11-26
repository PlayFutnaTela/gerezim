-- Cria a tabela de perfis
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
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
