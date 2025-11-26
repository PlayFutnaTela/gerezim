-- Migration: create is_admin helper and update profiles policies to avoid recursive RLS evaluation
-- This migration is defensive / idempotent and intended to prevent server-side errors

begin;

-- Create a helper function that checks whether a given user id is admin
-- We create it only if it does not exist to keep the migration idempotent
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

-- Replace problematic policies with safer ones that call is_admin(auth.uid())
-- For select: allow profile owner OR admin via is_admin()
-- For update: allow profile owner OR admin via is_admin()

-- Recreate select policy using a safe approach
-- Drop old policy if exists (some Postgres versions don't support IF EXISTS on CREATE POLICY, so we remove and add)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can view any profile') THEN
    EXECUTE 'DROP POLICY "Admins can view any profile" ON public.profiles';
  END IF;
  EXECUTE 'CREATE POLICY "Admins can view any profile" ON public.profiles FOR SELECT USING ( auth.uid() = id OR public.is_admin(auth.uid()) )';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update any profile') THEN
    EXECUTE 'DROP POLICY "Admins can update any profile" ON public.profiles';
  END IF;
  EXECUTE 'CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id OR public.is_admin(auth.uid()) ) WITH CHECK ( auth.uid() = id OR public.is_admin(auth.uid()) )';
END$$;

commit;
