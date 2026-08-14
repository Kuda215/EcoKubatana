-- ============================================
-- NOTIFICATION STATE - BELL ICON UNREAD TRACKING
-- ============================================
-- Run this in Supabase SQL Editor
-- Backs the topbar bell icon: tracks, per user, when they last opened the
-- alerts dropdown, so the badge can show a real "unread since last time"
-- count instead of a hardcoded number.
--
-- Deliberately a separate table rather than a new column/policy on
-- `profiles` - profiles' RLS has already caused enough grief this session
-- (see 10_profiles_admin_policy.sql). This table's policies only ever
-- reference its own rows via auth.uid() = user_id, so there's no risk of
-- the same self-referencing-policy recursion.

CREATE TABLE IF NOT EXISTS notification_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_seen_alerts_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01T00:00:00Z',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notification_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notification state"
  ON notification_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_notification_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_state_updated_at ON notification_state;
CREATE TRIGGER notification_state_updated_at
  BEFORE UPDATE ON notification_state
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_state_updated_at();

COMMENT ON TABLE notification_state IS 'Per-user last-seen timestamp for the topbar alerts bell';
