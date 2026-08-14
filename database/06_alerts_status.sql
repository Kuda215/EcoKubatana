-- ============================================
-- ALERTS PROPOSE/PUBLISH WORKFLOW - MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor (after 05_alerts_schema.sql)
-- Adds a review workflow: anyone can propose an alert, only admins publish it.

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'published', 'rejected'));
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

-- Backfill: alerts created before this migration were sent immediately on
-- creation, so treat them as already published.
UPDATE alerts SET status = 'published', published_at = created_at WHERE status = 'pending';

-- Replace the admin-only insert policy - anyone authenticated can now propose
-- an alert (it stays invisible/unpublished until an admin reviews it).
DROP POLICY IF EXISTS "Admins can create alerts" ON alerts;
CREATE POLICY "Authenticated users can propose alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update (publish/reject) pending alerts
CREATE POLICY "Admins can update alerts"
  ON alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON COLUMN alerts.status IS 'pending = awaiting admin review, published = live + messaged, rejected = dismissed';
