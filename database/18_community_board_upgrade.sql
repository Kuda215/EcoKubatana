-- ============================================
-- COMMUNITY BOARD UPGRADE - REPORTING + OFFERS & NEEDS
-- ============================================
-- Run this in Supabase SQL Editor (after 03_community_schema.sql)
--
-- 1. community_posts.hidden + community_post_reports:
--    any member can report a post; once 3 different people report it, it is hidden
--    automatically. Admins can hide/unhide any post (existing "Admins can update any post" policy).
-- 2. aid_posts: the "Offers & Needs" board ("I can help" / "I need help").
--    Plain CRUD fully expressed by RLS - no edge function needed.

-- ─────────────────────────────────────────────
-- 1. POST REPORTING / HIDING
-- ─────────────────────────────────────────────
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS community_post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'Other' CHECK (reason IN ('False information', 'Abusive', 'Spam', 'Other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reports_post ON community_post_reports(post_id);

ALTER TABLE community_post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can report posts" ON community_post_reports;
CREATE POLICY "Users can report posts"
  ON community_post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters see their own reports (so the UI can show "Reported"); admins see all
DROP POLICY IF EXISTS "Users view own reports, admins view all" ON community_post_reports;
CREATE POLICY "Users view own reports, admins view all"
  ON community_post_reports FOR SELECT
  USING (auth.uid() = reporter_id OR is_admin());

-- Auto-hide a post once 3 different members have reported it.
-- SECURITY DEFINER so the reporter (who can't update other people's posts) can still trigger it.
CREATE OR REPLACE FUNCTION public.auto_hide_reported_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.community_post_reports WHERE post_id = NEW.post_id) >= 3 THEN
    UPDATE public.community_posts SET hidden = true WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_post_reports_auto_hide ON community_post_reports;
CREATE TRIGGER community_post_reports_auto_hide
  AFTER INSERT ON community_post_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_hide_reported_post();

-- ─────────────────────────────────────────────
-- 2. OFFERS & NEEDS (MUTUAL AID)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aid_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Stored on the row because profiles RLS only lets users read their own profile
  author_name TEXT NOT NULL DEFAULT 'Community member',
  kind TEXT NOT NULL CHECK (kind IN ('offer', 'need')),
  category TEXT NOT NULL CHECK (category IN ('Shelter', 'Water', 'Food', 'Transport', 'Medical', 'Check on someone', 'Other')),
  details TEXT NOT NULL,
  location TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sorted')),
  sorted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aid_posts_status ON aid_posts(status);
CREATE INDEX IF NOT EXISTS idx_aid_posts_created_at ON aid_posts(created_at DESC);

ALTER TABLE aid_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signed-in users can view aid posts" ON aid_posts;
CREATE POLICY "Signed-in users can view aid posts"
  ON aid_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create own open aid posts" ON aid_posts;
CREATE POLICY "Users can create own open aid posts"
  ON aid_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND status = 'open');

-- The author marks their own post sorted; admins can update any (e.g. close stale posts)
DROP POLICY IF EXISTS "Authors and admins can update aid posts" ON aid_posts;
CREATE POLICY "Authors and admins can update aid posts"
  ON aid_posts FOR UPDATE
  USING (auth.uid() = author_id OR is_admin());

DROP POLICY IF EXISTS "Authors and admins can delete aid posts" ON aid_posts;
CREATE POLICY "Authors and admins can delete aid posts"
  ON aid_posts FOR DELETE
  USING (auth.uid() = author_id OR is_admin());

COMMENT ON TABLE aid_posts IS 'Community Board "Offers & Needs": members offer help (shelter, water, transport...) or ask for it, and mark it sorted once handled';
COMMENT ON TABLE community_post_reports IS 'Member reports on community posts; 3 reports auto-hide the post';
