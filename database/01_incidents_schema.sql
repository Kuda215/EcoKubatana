-- ============================================
-- INCIDENTS SYSTEM - FULL DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates all tables, policies, and functions for incident management

-- ─────────────────────────────────────────────
-- 1. CREATE INCIDENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Pollution', 'Other')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'investigating', 'verified', 'resolved', 'rejected')),
  
  -- Reporter information
  reporter_name TEXT,
  reporter_contact TEXT,
  reporter_id UUID REFERENCES profiles(id),
  
  -- Metadata
  date TEXT NOT NULL DEFAULT to_char(NOW(), 'DD Mon YYYY'),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  
  -- Additional fields
  image_url TEXT,
  coordinates POINT,
  affected_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_id ON incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- ─────────────────────────────────────────────
-- 2. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 3. CREATE RLS POLICIES
-- ─────────────────────────────────────────────

-- Everyone can view verified/active incidents
CREATE POLICY "Anyone can view public incidents"
  ON incidents FOR SELECT
  USING (status IN ('active', 'verified', 'resolved', 'investigating'));

-- Authenticated users can create incidents
CREATE POLICY "Authenticated users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own pending incidents
CREATE POLICY "Users can view own incidents"
  ON incidents FOR SELECT
  USING (reporter_id = auth.uid());

-- Admins can view all incidents
CREATE POLICY "Admins can view all incidents"
  ON incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update incidents (verify/reject/resolve)
CREATE POLICY "Admins can update incidents"
  ON incidents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete incidents
CREATE POLICY "Admins can delete incidents"
  ON incidents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- 4. CREATE HELPER FUNCTIONS
-- ─────────────────────────────────────────────

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS incidents_updated_at ON incidents;
CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incidents_updated_at();

-- Function to verify incident (admin only)
CREATE OR REPLACE FUNCTION verify_incident(incident_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can verify incidents';
  END IF;

  -- Update incident
  UPDATE incidents
  SET 
    status = 'verified',
    verified_at = NOW(),
    verified_by = auth.uid()
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject incident (admin only)
CREATE OR REPLACE FUNCTION reject_incident(incident_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject incidents';
  END IF;

  -- Update incident
  UPDATE incidents
  SET 
    status = 'rejected',
    verified_at = NOW(),
    verified_by = auth.uid()
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve incident (admin only)
CREATE OR REPLACE FUNCTION resolve_incident(incident_id UUID)
RETURNS incidents AS $$
DECLARE
  result incidents;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can resolve incidents';
  END IF;

  -- Update incident
  UPDATE incidents
  SET 
    status = 'resolved',
    resolved_at = NOW()
  WHERE id = incident_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 5. CREATE VIEW FOR PUBLIC INCIDENTS
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public_incidents AS
SELECT 
  id,
  title,
  type,
  location,
  description,
  severity,
  status,
  date,
  reported_at,
  image_url,
  affected_count,
  COALESCE(reporter_name, 'Anonymous') as reporter_name
FROM incidents
WHERE status IN ('active', 'verified', 'resolved', 'investigating')
ORDER BY reported_at DESC;

-- Grant access to view
GRANT SELECT ON public_incidents TO authenticated, anon;

COMMENT ON TABLE incidents IS 'Stores all climate incident reports from community members';
