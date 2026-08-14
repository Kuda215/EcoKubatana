-- ============================================
-- COMMUNITY BOARD SYSTEM - FULL DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates all tables for community board functionality

-- ─────────────────────────────────────────────
-- 1. CREATE COMMUNITIES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  area TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default community
INSERT INTO communities (name, description, area)
VALUES (
  'EcoKubatana Zimbabwe',
  'Community climate action network across Zimbabwe',
  'National'
) ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. CREATE COMMUNITY MEMBERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_points ON community_members(points DESC);

-- ─────────────────────────────────────────────
-- 3. CREATE POSTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Event', 'Solution', 'Campaign', 'Tip', 'Alert', 'Discussion')),
  
  verified BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  image_urls TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON community_posts(pinned DESC, created_at DESC);

-- ─────────────────────────────────────────────
-- 4. CREATE POST LIKES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- ─────────────────────────────────────────────
-- 5. CREATE POST COMMENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON post_comments(created_at ASC);

-- ─────────────────────────────────────────────
-- 6. CREATE COMMENT LIKES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- ─────────────────────────────────────────────
-- 7. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 8. CREATE RLS POLICIES
-- ─────────────────────────────────────────────

-- Communities: Everyone can view
CREATE POLICY "Anyone can view communities"
  ON communities FOR SELECT
  USING (true);

-- Community members: Everyone can view
CREATE POLICY "Anyone can view community members"
  ON community_members FOR SELECT
  USING (true);

-- Community members: Users can join
CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Posts: Everyone can view
CREATE POLICY "Anyone can view posts"
  ON community_posts FOR SELECT
  USING (true);

-- Posts: Authenticated users can create
CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Posts: Authors can update own posts
CREATE POLICY "Authors can update own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Posts: Admins can update any post
CREATE POLICY "Admins can update any post"
  ON community_posts FOR UPDATE
  USING (is_admin());

-- Posts: Authors and admins can delete
CREATE POLICY "Authors and admins can delete posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = author_id OR is_admin());

-- Likes: Everyone can view
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

-- Likes: Users can like
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Likes: Users can unlike own likes
CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: Everyone can view
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  USING (true);

-- Comments: Authenticated users can create
CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Comments: Authors can update own comments
CREATE POLICY "Authors can update own comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Comments: Authors and admins can delete
CREATE POLICY "Authors and admins can delete comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = author_id OR is_admin());

-- Comment likes policies (similar to post likes)
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 9. CREATE TRIGGERS FOR COUNTS
-- ─────────────────────────────────────────────

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_comments_count_trigger ON post_comments;
CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Auto-join users to default community on profile creation
CREATE OR REPLACE FUNCTION auto_join_default_community()
RETURNS TRIGGER AS $$
DECLARE
  default_community_id UUID;
BEGIN
  -- Get default community ID
  SELECT id INTO default_community_id
  FROM communities
  WHERE name = 'EcoKubatana Zimbabwe'
  LIMIT 1;

  -- Join user to default community
  IF default_community_id IS NOT NULL THEN
    INSERT INTO community_members (community_id, user_id)
    VALUES (default_community_id, NEW.id)
    ON CONFLICT DO NOTHING;
    
    -- Update community member count
    UPDATE communities
    SET member_count = member_count + 1
    WHERE id = default_community_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_join_community ON profiles;
CREATE TRIGGER auto_join_community
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_default_community();

-- Update community post count
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET post_count = post_count + 1
    WHERE id = NEW.community_id;
    
    UPDATE community_members
    SET post_count = post_count + 1,
        points = points + 10
    WHERE community_id = NEW.community_id AND user_id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = OLD.community_id;
    
    UPDATE community_members
    SET post_count = GREATEST(0, post_count - 1),
        points = GREATEST(0, points - 10)
    WHERE community_id = OLD.community_id AND user_id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_post_count_trigger ON community_posts;
CREATE TRIGGER community_post_count_trigger
  AFTER INSERT OR DELETE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_count();

-- Update member points for likes received
CREATE OR REPLACE FUNCTION update_member_points_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_community_id UUID;
BEGIN
  -- Get post author and community
  SELECT author_id, community_id INTO post_author_id, post_community_id
  FROM community_posts
  WHERE id = NEW.post_id;

  IF TG_OP = 'INSERT' THEN
    UPDATE community_members
    SET points = points + 2
    WHERE community_id = post_community_id AND user_id = post_author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_members
    SET points = GREATEST(0, points - 2)
    WHERE community_id = post_community_id AND user_id = post_author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_points_on_like_trigger ON post_likes;
CREATE TRIGGER member_points_on_like_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_member_points_on_like();

-- Update timestamp on post update
CREATE OR REPLACE FUNCTION update_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_updated_at ON community_posts;
CREATE TRIGGER post_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_updated_at();

DROP TRIGGER IF EXISTS comment_updated_at ON post_comments;
CREATE TRIGGER comment_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_updated_at();

COMMENT ON TABLE community_posts IS 'Community board posts with categories, likes, and comments';
COMMENT ON TABLE communities IS 'Community groups for different areas';
COMMENT ON TABLE community_members IS 'Member participation and leaderboard data';
