-- ============================================
-- VIDEOS - DATABASE-BACKED, ADMIN-EDITABLE
-- ============================================
-- Run this in Supabase SQL Editor
-- Replaces the hardcoded video list in KnowledgeHub.jsx with a real table.
-- No edge function needed for this one - plain CRUD, fully expressed by RLS.
-- youtube_url accepts any standard YouTube URL format; the embed ID is
-- extracted client-side (see getYouTubeEmbedId in KnowledgeHub.jsx).

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  duration TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🎥',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read the video list
CREATE POLICY "Anyone authenticated can read videos"
  ON videos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can add, edit, or delete videos
CREATE POLICY "Admins can manage videos"
  ON videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Keep updated_at current on edits
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS videos_updated_at ON videos;
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();

-- Seed with real, existing public educational videos matching the categories
-- already shown in the UI, so the migration is a no-op visually.
INSERT INTO videos (title, youtube_url, category, duration, emoji, display_order) VALUES
  ('Why Does Climate Change Matter? We Asked a NASA Scientist', 'https://www.youtube.com/watch?v=YfWCUYX2_U0', 'Basics', '4:12', '🌍', 1),
  ('How to Conserve Water | National Geographic', 'https://www.youtube.com/watch?v=oW-iuvCZnNA', 'Water', '3:26', '💧', 2),
  ('Climate Smart Agriculture: Drought-Resistant Crops & Seeds', 'https://www.youtube.com/watch?v=_xIPZMJ_kKc', 'Agriculture', '6:45', '🌾', 3),
  ('How Solar Panels Work (Simple Explanation)', 'https://www.youtube.com/watch?v=RpBSqe1dg1s', 'Energy', '8:03', '☀️', 4),
  ('Using Community Action to Help Solve the Climate Crisis | TEDxMIT', 'https://www.youtube.com/watch?v=zzDDYSOncPQ', 'Community', '11:47', '👥', 5),
  ('Disaster Preparedness: Building Community Resilience', 'https://www.youtube.com/watch?v=WGXpzPRTV_s', 'Safety', '14:20', '🚨', 6);

COMMENT ON TABLE videos IS 'Admin-editable video list shown in KnowledgeHub';
