-- ============================================
-- ALERTS SYSTEM - FULL DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates all tables, policies for the alerts broadcast + subscribe system

-- ─────────────────────────────────────────────
-- 1. CREATE ALERTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Info' CHECK (level IN ('Info', 'Warning', 'Critical', 'Emergency')),
  area TEXT NOT NULL DEFAULT 'All Areas',
  message TEXT NOT NULL,
  targets JSONB NOT NULL DEFAULT '{"all": true, "volunteers": true, "admins": false}',

  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- ─────────────────────────────────────────────
-- 2. CREATE ALERT SUBSCRIPTIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_subs_user ON alert_subscriptions(user_id);

-- ─────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 4. CREATE RLS POLICIES
-- ─────────────────────────────────────────────
-- (Defense-in-depth: the edge function uses the service role key and
-- bypasses these, same as incidents/community. These policies apply if
-- anything ever queries these tables directly via the client.)

-- Alerts: everyone can view
CREATE POLICY "Anyone can view alerts"
  ON alerts FOR SELECT
  USING (true);

-- Alerts: only admins can create
CREATE POLICY "Admins can create alerts"
  ON alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Subscriptions: users can view their own
CREATE POLICY "Users can view own subscription"
  ON alert_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions: authenticated users can subscribe
CREATE POLICY "Authenticated users can subscribe"
  ON alert_subscriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

COMMENT ON TABLE alerts IS 'Emergency/weather alerts broadcast by admins to the community';
COMMENT ON TABLE alert_subscriptions IS 'Phone numbers subscribed to receive alerts via SMS/WhatsApp';
