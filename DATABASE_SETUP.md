# 🚀 DATABASE & EDGE FUNCTIONS SETUP GUIDE

Complete step-by-step guide to set up your EcoKubatana database and API endpoints.

---

## 📋 STEP 1: Run SQL Scripts in Supabase

Go to your **Supabase Dashboard** → **SQL Editor**

### 1.1 Create Incidents Tables
Copy and paste the entire contents of:
```
database/01_incidents_schema.sql
```
Click **RUN** ▶️

### 1.2 Insert Default Incidents
Copy and paste the entire contents of:
```
database/02_incidents_seed_data.sql
```
Click **RUN** ▶️

### 1.3 Create Community Board Tables
Copy and paste the entire contents of:
```
database/03_community_schema.sql
```
Click **RUN** ▶️

### 1.4 Insert Community Seed Data
Copy and paste the entire contents of:
```
database/04_community_seed_data.sql
```
Click **RUN** ▶️

✅ **Verify:** Check the **Table Editor** - you should see:
- `incidents` (4 rows)
- `communities` (1 row)
- `community_posts` (5-6 rows)
- `community_members` (your users auto-joined)

---

## 🔧 STEP 2: Deploy Edge Functions

You have 2 options:

### Option A: Deploy via Supabase Dashboard (EASIEST)

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Function name: `incidents`
4. Copy the entire code from `supabase/functions/incidents/index.ts`
5. Paste and click **Deploy**
6. Repeat for function name: `community` using `supabase/functions/community/index.ts`

### Option B: Deploy via Supabase CLI

```powershell
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy incidents
supabase functions deploy community
```

✅ **Verify:** Go to **Edge Functions** → you should see both functions listed

---

## 🌐 STEP 3: Get Your Edge Function URLs

Your function URLs will be:
```
https://your-project-ref.supabase.co/functions/v1/incidents
https://your-project-ref.supabase.co/functions/v1/community
```

Replace `your-project-ref` with your actual project reference (found in Settings → API → Project URL)

---

## 🔐 STEP 4: Test Edge Functions

### Test Incidents API:

```powershell
# List all incidents (public)
curl https://your-project-ref.supabase.co/functions/v1/incidents

# Create incident (requires auth token)
curl -X POST https://your-project-ref.supabase.co/functions/v1/incidents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","type":"Flood","location":"Test Area","description":"Test incident","severity":"low"}'
```

### Test Community API:

```powershell
# List all posts
curl https://your-project-ref.supabase.co/functions/v1/community/posts

# Get community stats
curl https://your-project-ref.supabase.co/functions/v1/community/stats

# Get leaderboard
curl https://your-project-ref.supabase.co/functions/v1/community/leaderboard
```

✅ **Expected Result:** You should get JSON responses with data

---

## ⚙️ STEP 5: No Code Changes Needed!

The React app is already configured to use your edge functions automatically via `src/lib/api.js`

The API utility uses your existing `VITE_SUPABASE_URL` from `.env` to construct the edge function URLs.

Just restart your dev server:
```powershell
npm run dev
```

---

## 🎯 WHAT EACH COMPONENT DOES NOW

### Incidents System
- ✅ **View incidents** - Real-time from database
- ✅ **Report new** - Saves to database with user info
- ✅ **Admin verify/reject** - Updates status with timestamps
- ✅ **Filter by type/status** - Server-side filtering
- ✅ **Track reporter** - Links to user profiles

### Community Board
- ✅ **View posts** - Loads from database with accurate counts
- ✅ **Create posts** - Awards points automatically
- ✅ **Like posts** - Updates likes_count in real-time
- ✅ **Add comments** - Nested comments with author info
- ✅ **Leaderboard** - Auto-calculated from database
- ✅ **Welcome message** - Pinned first post
- ✅ **Stats** - Accurate member/post counts from DB

---

## 🔍 TROUBLESHOOTING

### "Edge function not found"
- Make sure you deployed both functions
- Check function names are exactly: `incidents` and `community`
- Verify your project URL in `.env`

### "Authentication required"
- Make sure user is logged in
- Check auth token is being passed (handled automatically by api.js)

### "Admin access required"
- Verify user has `role = 'admin'` in profiles table
- Update role: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';`

### "CORS error"
- Edge functions already have CORS headers configured
- Make sure you're calling the correct URL
- Check browser console for exact error

### Database issues
- Run SQL scripts in order (01 → 02 → 03 → 04)
- Check for errors in SQL Editor
- Verify tables created: Table Editor → see all tables

---

## 📊 VERIFY EVERYTHING WORKS

1. **Register/Login** - Should auto-join community
2. **View Incidents** - Should see 4 default incidents
3. **Community Board** - Should see welcome message + 5 posts
4. **Create Post** - Should appear immediately
5. **Like Post** - Count should increment
6. **Add Comment** - Should show under post
7. **Leaderboard** - Should show members with points
8. **Admin Portal** (if admin) - Verify/reject should work

---

## 🎉 YOU'RE DONE!

Your EcoKubatana app now has:
- ✅ Fully functional incident reporting with verification
- ✅ Live community board with real-time interactions
- ✅ Accurate statistics from database
- ✅ Role-based access control
- ✅ Leaderboard and points system
- ✅ Auto-scaling serverless API

All data is persistent and secure! 🔒

---

## 📞 NEED HELP?

- Check Supabase Dashboard → Logs → Edge Functions
- Look at browser console for network errors
- Verify RLS policies are active (they auto-enable via scripts)
- Test SQL queries directly in SQL Editor

**Common SQL to check data:**
```sql
-- Check incidents
SELECT * FROM incidents ORDER BY created_at DESC;

-- Check posts
SELECT * FROM community_posts ORDER BY created_at DESC;

-- Check your user
SELECT * FROM profiles WHERE email = 'your@email.com';

-- Check community stats
SELECT * FROM communities;

-- Check leaderboard
SELECT * FROM community_members ORDER BY points DESC LIMIT 10;
```
