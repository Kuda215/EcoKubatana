-- ============================================
-- HELP REQUESTS - REQUEST HELP BUTTON + ADMIN VIEW
-- ============================================
-- Run this in Supabase SQL Editor
-- Backs the "Request Help" modal (topbar) and the AdminPortal "Help Requests" tab.
-- Plain CRUD fully expressed by RLS - no edge function needed.

CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL DEFAULT 'Other' CHECK (type IN ('Medical', 'Fire', 'Rescue', 'Other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'resolved')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_user ON help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON help_requests(created_at DESC);

ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Users can submit their own help request
CREATE POLICY "Users can create their own help requests"
  ON help_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own requests; admins can see everyone's
CREATE POLICY "Users can view own help requests, admins view all"
  ON help_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update status / assignment (respond, resolve)
CREATE POLICY "Admins can update help requests"
  ON help_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Keep updated_at current on edits
CREATE OR REPLACE FUNCTION update_help_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS help_requests_updated_at ON help_requests;
CREATE TRIGGER help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_help_requests_updated_at();

COMMENT ON TABLE help_requests IS 'Emergency help requests submitted via the Request Help modal, triaged by admins in AdminPortal';
