-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tabela de Oportunidades
create table if not exists opportunities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  category text not null check (category in ('carro', 'imovel', 'empresa', 'item_premium')),
  value numeric not null default 0,
  description text,
  photos text[] default array[]::text[],
  location text,
  status text not null default 'novo' check (status in ('novo', 'em_negociacao', 'vendido')),
  pipeline_stage text not null default 'Novo' check (pipeline_stage in ('Novo', 'Interessado', 'Proposta enviada', 'Negociação', 'Finalizado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Contatos
create table if not exists contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  phone text,
  source text,
  interests text,
  status text default 'novo' check (status in ('novo', 'quente', 'morno', 'frio')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Interações (Histórico)
create table if not exists interactions (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references contacts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Storage Bucket for Photos
insert into storage.buckets (id, name, public) 
values ('opportunity-images', 'opportunity-images', true)
on conflict (id) do nothing;

-- RLS Policies (Row Level Security)
-- Enable RLS
alter table opportunities enable row level security;
alter table contacts enable row level security;
alter table interactions enable row level security;

-- Policies for Opportunities
create policy "Users can view their own opportunities" 
on opportunities for select using (auth.uid() = user_id);

create policy "Public can view opportunities" 
on opportunities for select using (true);

create policy "Users can insert their own opportunities" 
on opportunities for insert with check (auth.uid() = user_id);

create policy "Users can update their own opportunities" 
on opportunities for update using (auth.uid() = user_id);

create policy "Users can delete their own opportunities" 
on opportunities for delete using (auth.uid() = user_id);

-- Policies for Contacts
create policy "Users can view their own contacts" 
on contacts for select using (auth.uid() = user_id);

create policy "Users can insert their own contacts" 
on contacts for insert with check (auth.uid() = user_id);

create policy "Users can update their own contacts" 
on contacts for update using (auth.uid() = user_id);

create policy "Users can delete their own contacts" 
on contacts for delete using (auth.uid() = user_id);

-- Policies for Interactions
-- Interactions are linked to contacts, which are linked to users. 
-- We can check if the contact belongs to the user.
create policy "Users can view interactions of their contacts" 
on interactions for select using (
  exists (
    select 1 from contacts 
    where contacts.id = interactions.contact_id 
    and contacts.user_id = auth.uid()
  )
);

create policy "Users can insert interactions for their contacts" 
on interactions for insert with check (
  exists (
    select 1 from contacts 
    where contacts.id = interactions.contact_id 
    and contacts.user_id = auth.uid()
  )
);

-- Storage Policies
create policy "Public Access to Images"
on storage.objects for select
using ( bucket_id = 'opportunity-images' );

create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'opportunity-images' and auth.role() = 'authenticated' );

create policy "Users can update their own images"
on storage.objects for update
using ( bucket_id = 'opportunity-images' and auth.uid() = owner );

create policy "Users can delete their own images"
on storage.objects for delete
using ( bucket_id = 'opportunity-images' and auth.uid() = owner );
