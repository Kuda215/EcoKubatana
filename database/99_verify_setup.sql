-- ============================================
-- VERIFICATION SCRIPT
-- ============================================
-- Run this AFTER running all 5 database setup scripts
-- This checks if everything is configured correctly

-- ─────────────────────────────────────────────
-- 1. CHECK TABLES EXIST
-- ─────────────────────────────────────────────
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ PASS - All tables created'
    ELSE '❌ FAIL - Missing tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles',
    'incidents',
    'communities',
    'community_members',
    'community_posts',
    'post_likes',
    'post_comments',
    'comment_likes'
  );

-- ─────────────────────────────────────────────
-- 2. CHECK is_admin() FUNCTION EXISTS
-- ─────────────────────────────────────────────
SELECT 
  'is_admin() Function' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS - Function exists'
    ELSE '❌ FAIL - Function missing (run 00_fix_profiles_recursion.sql)'
  END as status
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- ─────────────────────────────────────────────
-- 3. CHECK PROFILES POLICIES (Must be simple)
-- ─────────────────────────────────────────────
SELECT 
  'Profiles Policies' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - Policies created'
    ELSE '❌ FAIL - Missing policies'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles';

-- ─────────────────────────────────────────────
-- 4. CHECK SAMPLE DATA EXISTS
-- ─────────────────────────────────────────────
SELECT 
  'Incidents Sample Data' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ PASS - Sample incidents loaded'
    ELSE '❌ FAIL - Run 02_incidents_seed_data.sql'
  END as status
FROM incidents;

SELECT 
  'Community Posts Sample Data' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS - Sample posts loaded'
    ELSE '❌ FAIL - Run 04_community_seed_data.sql'
  END as status
FROM community_posts;

-- ─────────────────────────────────────────────
-- 5. CHECK COMMUNITIES CREATED
-- ─────────────────────────────────────────────
SELECT 
  'Default Community' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ PASS - EcoKubatana Zimbabwe created'
    ELSE '❌ FAIL - Run 03_community_schema.sql'
  END as status
FROM communities 
WHERE name = 'EcoKubatana Zimbabwe';

-- ─────────────────────────────────────────────
-- 6. LIST ALL TABLES WITH ROW COUNTS
-- ─────────────────────────────────────────────
SELECT 
  'SUMMARY' as info,
  '─────────────────────────────' as separator;

SELECT 
  t.table_name,
  (
    SELECT COUNT(*) 
    FROM information_schema.tables t2 
    WHERE t2.table_schema = 'public' 
      AND t2.table_name = t.table_name
  ) as exists_check,
  COALESCE(
    (
      SELECT reltuples::bigint
      FROM pg_class
      WHERE relname = t.table_name
    ), 
    0
  ) as approx_rows
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    'profiles',
    'incidents',
    'communities',
    'community_members',
    'community_posts',
    'post_likes',
    'post_comments',
    'comment_likes'
  )
ORDER BY t.table_name;

-- ─────────────────────────────────────────────
-- 7. CHECK FUNCTIONS
-- ─────────────────────────────────────────────
SELECT 
  'FUNCTIONS' as info,
  '─────────────────────────────' as separator;

SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN ('is_admin', 'verify_incident', 'reject_incident', 'resolve_incident')
    THEN '✅ Required'
    ELSE '✓ Extra'
  END as importance
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE '%admin%' 
     OR routine_name LIKE '%incident%'
ORDER BY routine_name;

-- ─────────────────────────────────────────────
-- INTERPRETATION GUIDE
-- ─────────────────────────────────────────────
SELECT 
  'RESULT INTERPRETATION' as guide,
  '─────────────────────────────' as separator;

SELECT 
  '✅ ALL CHECKS PASS → Ready to deploy Edge Functions and test app' as next_step
WHERE (
  -- All required checks
  EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_admin')
  AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 8
  AND (SELECT COUNT(*) FROM incidents) >= 1
  AND (SELECT COUNT(*) FROM community_posts) >= 1
  AND (SELECT COUNT(*) FROM communities) >= 1
);

SELECT 
  '❌ SOME CHECKS FAILED → Review output above and re-run missing SQL files' as next_step
WHERE NOT EXISTS (
  SELECT 1 WHERE (
    EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_admin')
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 8
    AND (SELECT COUNT(*) FROM incidents) >= 1
    AND (SELECT COUNT(*) FROM community_posts) >= 1
    AND (SELECT COUNT(*) FROM communities) >= 1
  )
);
