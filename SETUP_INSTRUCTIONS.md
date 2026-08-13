# 🎯 COMPLETE SETUP INSTRUCTIONS
# Run these commands in order to set up your EcoKubatana database and edge functions

## ═══════════════════════════════════════════════════════════
## STEP 1: RUN SQL SCRIPTS IN SUPABASE
## ═══════════════════════════════════════════════════════════

# Open Supabase Dashboard → SQL Editor
# Run each script in this order (copy entire file contents):

1. database/01_incidents_schema.sql       # Creates incidents table + functions  
2. database/02_incidents_seed_data.sql    # Inserts 4 default incidents
3. database/03_community_schema.sql       # Creates community boards tables
4. database/04_community_seed_data.sql    # Inserts welcome post + seed data

## ═══════════════════════════════════════════════════════════
## STEP 2: DEPLOY EDGE FUNCTIONS
## ═══════════════════════════════════════════════════════════

### Option A: Deploy via Supabase Dashboard (EASIEST โœ…)

1. Go to Edge Functions in Supabase Dashboard
2. Click "Create a new function"
3. Function name: incidents
4. Copy entire code from: supabase/functions/incidents/index.ts
5. Paste and Deploy
6. Repeat for: community (using supabase/functions/community/index.ts)

### Option B: Deploy via CLI

# Install CLI
npm install -g supabase

# Login
supabase login

# Link project (get ref from Settings → API → Project URL)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy both functions
supabase functions deploy incidents
supabase functions deploy community

## ═══════════════════════════════════════════════════════════
## STEP 3: VERIFY EVERYTHING WORKS
## ═══════════════════════════════════════════════════════════

# Restart your dev server
npm run dev

# Test the following:
✅ Register/Login - Should work
✅ View Incidents - Should see 4 default incidents
✅ Report Incident - Should save to database
✅ Community Board - Should see welcome message + posts
✅ Create Post - Should appear immediately with points awarded
✅ Like Post - Should increment count
✅ Add Comment - Should show under post
✅ Leaderboard - Should show accurate stats
✅ Admin Portal (if admin) - Verify/reject should work

## ═══════════════════════════════════════════════════════════
## STEP 4: GRANT YOURSELF ADMIN ACCESS (OPTIONAL)
## ═══════════════════════════════════════════════════════════

# Run this in Supabase SQL Editor (replace with your email):

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';

## ═══════════════════════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════════════════════

### "Edge function not found"
- Verify functions deployed: Supabase Dashboard → Edge Functions
- Check function names are exactly: incidents and community
- Verify VITE_SUPABASE_URL in .env matches your project

### "Authentication required" errors
- Make sure you're logged in
- Check auth.getSession() returns user

### "Admin access required"
- Run SQL: UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
- Logout and login again

### Database errors
- Check Table Editor → verify tables exist:
  * incidents (4 rows)
  * communities (1 row)
  * community_posts (5-6 rows)
  * profiles (your user)
- If missing, re-run SQL scripts in order

### CORS errors
- Edge functions already have CORS configured
- Make sure URL is correct in api.js
- Check browser console for exact error

## ═══════════════════════════════════════════════════════════
## HELPFUL SQL QUERIES
## ═══════════════════════════════════════════════════════════

-- View all incidents
SELECT * FROM incidents ORDER BY created_at DESC;

-- View community posts
SELECT * FROM community_posts ORDER BY created_at DESC;

-- View your user profile
SELECT * FROM profiles WHERE email = 'your@email.com';

-- View community stats
SELECT * FROM communities;

-- View leaderboard
SELECT 
  p.name,
  cm.points,
  cm.post_count
FROM community_members cm
JOIN profiles p ON p.id = cm.user_id
ORDER BY cm.points DESC
LIMIT 10;

-- Check if user is in community
SELECT * FROM community_members WHERE user_id = 'USER_UUID';

-- Manual join user to community (if needed)
INSERT INTO community_members (community_id, user_id)
VALUES (
  (SELECT id FROM communities WHERE name = 'EcoKubatana Zimbabwe'),
  'USER_UUID'
);

## ═══════════════════════════════════════════════════════════
## 🎉 THAT'S IT!
## ═══════════════════════════════════════════════════════════

Your EcoKubatana app now has:
✅ Full incident management (create, verify, reject, resolve, delete)
✅ Live community board with posts, likes, comments
✅ Accurate real-time statistics from database
✅ Points and leaderboard system
✅ Role-based access control (member/volunteer/admin)
✅ Auto-scaling serverless API (Supabase Edge Functions)
✅ Row-level security policies
✅ Automated triggers for counts and points

Everything is persistent and scales automatically! 🚀
