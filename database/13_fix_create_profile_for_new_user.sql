-- ============================================
-- FIX: create_profile_for_new_user() breaks new signups
-- ============================================
-- Run this in Supabase SQL Editor
--
-- The actual live trigger on auth.users (on_auth_user_created) calls
-- create_profile_for_new_user() - a function that does not appear in any
-- tracked SQL file in this repo (not 03_community_schema.sql, not
-- SETUP_GUIDE.md/ADD_KEYS.md/QUICK_FIX.md, which all reference a
-- differently-named handle_new_user() that is no longer attached to
-- anything). It must have been created directly against the database at
-- some point outside these files.
--
-- Its body does "INSERT INTO profiles (...)" with no public. qualification
-- and no SET search_path - the exact same bug class as the original
-- auto_join_default_community fix earlier this session. When this fires
-- from within the Auth service's internal transaction (whose search_path
-- excludes public), it fails with "relation \"profiles\" does not exist",
-- aborting the whole signup.

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
