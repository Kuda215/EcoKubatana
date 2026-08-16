-============================================
-- WELLBEING SHARES -  FULL DATABASE SCHEMA
-- ============================================
-- Stores anonymous wellbeing/community shares.
-- ============================================

-- Create the wellbeing shares table
CREATE TABLE IF NOT EXISTS wellbeing_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  support_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE wellbeing_shares ENABLE ROW LEVEL SECURITY;

-- Add an index for sorting shares by creation date
CREATE INDEX IF NOT EXISTS idx_wellbeing_shares_created_at
  ON wellbeing_shares(created_at DESC);

-- Add an index for filtering hidden shares
CREATE INDEX IF NOT EXISTS idx_wellbeing_shares_is_hidden
  ON wellbeing_shares(is_hidden);

-- Describe the purpose of the table
COMMENT ON TABLE wellbeing_shares IS
  'Anonymous user wellbeing shares and community support posts';