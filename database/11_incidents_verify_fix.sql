-- ============================================
-- FIX: verify_incident / reject_incident / resolve_incident
-- ============================================
-- Run this in Supabase SQL Editor
--
-- These SECURITY DEFINER functions are called from the incidents edge
-- function (supabase/functions/incidents/index.ts) via its service-role
-- client. The service-role client does not forward the calling user's JWT
-- as the request's auth context, so auth.uid() resolves to NULL inside
-- these functions - their internal "is this user an admin" check always
-- fails with "Only admins can verify/reject/resolve incidents", even when
-- the edge function itself already confirmed the caller is an admin.
--
-- This was never caught before because the AdminPortal Reports tab only
-- started calling the real incidents API in this change - it previously
-- just mutated local mock state.
--
-- Fix: accept the admin's user id explicitly as a parameter (the edge
-- function already knows it from the validated JWT) instead of relying
-- on auth.uid() inside the function.

DROP FUNCTION IF EXISTS verify_incident(UUID);
DROP FUNCTION IF EXISTS reject_incident(UUID);
DROP FUNCTION IF EXISTS resolve_incident(UUID);

CREATE OR REPLACE FUNCTION verify_incident(incident_id UUID, admin_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can verify incidents';
  END IF;

  UPDATE incidents
  SET
    status = 'verified',
    verified_at = NOW(),
    verified_by = admin_id
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_incident(incident_id UUID, admin_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject incidents';
  END IF;

  UPDATE incidents
  SET
    status = 'rejected',
    verified_at = NOW(),
    verified_by = admin_id
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION resolve_incident(incident_id UUID, admin_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can resolve incidents';
  END IF;

  UPDATE incidents
  SET
    status = 'resolved',
    resolved_at = NOW()
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
