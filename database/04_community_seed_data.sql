-- ============================================
-- COMMUNITY BOARD - SEED DATA
-- ============================================
-- This creates a welcome post and sample posts

DO $$
DECLARE
  default_community_id UUID;
  system_user_id UUID;
BEGIN
  -- Get default community ID
  SELECT id INTO default_community_id
  FROM communities
  WHERE name = 'EcoKubatana Zimbabwe'
  LIMIT 1;

  -- Get or create system user for welcome message
  SELECT id INTO system_user_id
  FROM profiles
  WHERE email = 'system@ecokubatana.org'
  LIMIT 1;

  -- If system user doesn't exist, use first admin or create placeholder
  IF system_user_id IS NULL THEN
    SELECT id INTO system_user_id
    FROM profiles
    WHERE role = 'admin'
    LIMIT 1;
  END IF;

  -- Insert welcome post (always first, pinned)
  INSERT INTO community_posts (
    community_id,
    author_id,
    content,
    category,
    verified,
    pinned
  ) VALUES (
    default_community_id,
    COALESCE(system_user_id, gen_random_uuid()),
    '🌿 Welcome to EcoKubatana Zimbabwe! This is our community space to share climate solutions, coordinate events, and support each other. Feel free to post tips, ask questions, and take climate action together. Let''s build a resilient Zimbabwe! 🇿🇼',
    'Alert',
    true,
    true
  ) ON CONFLICT DO NOTHING;

  -- Insert sample posts
  INSERT INTO community_posts (
    community_id,
    author_id,
    content,
    category,
    verified,
    pinned,
    likes_count,
    comments_count
  ) VALUES
    (
      default_community_id,
      COALESCE(system_user_id, gen_random_uuid()),
      'Rainwater harvesting training this Saturday 9am at the Community Hall. Bring your household water needs discussion.',
      'Event',
      true,
      true,
      24,
      2
    ),
    (
      default_community_id,
      COALESCE(system_user_id, gen_random_uuid()),
      'We built fenced garden beds to prevent soil erosion during heavy rain. I can share the plans with anyone interested! The design uses repurposed timber and costs under R200.',
      'Solution',
      true,
      false,
      41,
      2
    ),
    (
      default_community_id,
      COALESCE(system_user_id, gen_random_uuid()),
      'Community clean-up campaign next weekend. Let''s clear drainage channels before the rainy season. Who is joining? 🙋 We need at least 30 volunteers!',
      'Campaign',
      false,
      false,
      63,
      3
    ),
    (
      default_community_id,
      COALESCE(system_user_id, gen_random_uuid()),
      '🌱 Tip: Plant vetiver grass along slopes to reduce runoff. It''s cheap, grows fast and saves your soil! Also great for stabilizing riverbanks.',
      'Tip',
      true,
      false,
      37,
      1
    ),
    (
      default_community_id,
      COALESCE(system_user_id, gen_random_uuid()),
      '⚠️ WEATHER ALERT: Heavy rainfall expected this weekend across all zones. Please clear gutters, check drainage, and prepare emergency kits. Stay safe, community!',
      'Alert',
      true,
      false,
      89,
      2
    )
  ON CONFLICT DO NOTHING;

END $$;

-- Verify posts were created
SELECT 
  id,
  LEFT(content, 50) as content_preview,
  category,
  verified,
  pinned,
  likes_count,
  comments_count
FROM community_posts
ORDER BY pinned DESC, created_at ASC;

-- Show community stats
SELECT 
  name,
  member_count,
  post_count
FROM communities;
