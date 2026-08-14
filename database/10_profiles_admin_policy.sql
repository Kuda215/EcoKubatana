-- ============================================
-- MEMBER / VOLUNTEER COUNTS - ADMIN RPC
-- ============================================
-- Run this in Supabase SQL Editor
-- The original profiles table (SETUP_GUIDE.md) only lets a user read their
-- own row. AdminPortal's Overview needs a real total member / volunteer
-- count, which needs some way to read across all profiles as an admin.
--
-- Earlier attempts added a new "Admins can view all profiles" SELECT policy
-- on profiles itself, checking admin status via a query back into profiles.
-- That reliably causes Postgres error 42P17 "infinite recursion detected in
-- policy for relation" - even wrapped in a SECURITY DEFINER function, the
-- moment the check is *evaluated as part of a policy on the same table*,
-- Postgres's recursion guard trips, regardless of role/ownership. A plain
-- RPC call to that same function (not nested inside another policy) does
-- NOT trip the guard - proven directly against this project's database.
--
-- So instead of a new policy, this migration adds NO new policy on profiles
-- at all. It adds one SECURITY DEFINER function that computes both counts
-- directly and is only ever called top-level via RPC, sidestepping the
-- recursive-policy trap entirely.

-- Clean up the broken policy/function from earlier attempts, if present
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP FUNCTION IF EXISTS is_admin_user();

CREATE OR REPLACE FUNCTION get_member_counts()
RETURNS TABLE(total_members BIGINT, total_volunteers BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles) AS total_members,
    (SELECT COUNT(*) FROM profiles WHERE role = 'volunteer') AS total_volunteers;
END;
$$;

GRANT EXECUTE ON FUNCTION get_member_counts() TO authenticated;
