# 🚀 QUICK FIX - RUN THIS NOW

## The Problem
```
"infinite recursion detected in policy for relation profiles"
```

## The Solution (3 Minutes)

### ✅ STEP 1: Fix Database (Supabase Dashboard)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run these 5 SQL files **in order**:

```
📁 database/00_fix_profiles_recursion.sql  ← RUN FIRST! (Fixes recursion)
📁 database/01_incidents_schema.sql
📁 database/02_incidents_seed_data.sql
📁 database/03_community_schema.sql
📁 database/04_community_seed_data.sql
```

Copy entire file content → Paste → Click **RUN** ▶️ → Wait for success → Next file

---

### ✅ STEP 2: Deploy Edge Functions

**Option A - Dashboard (Easier):**
1. Supabase Dashboard → **Edge Functions**
2. Create function: `incidents`
   - Copy code from `supabase/functions/incidents/index.ts`
3. Create function: `community`
   - Copy code from `supabase/functions/community/index.ts`

**Option B - CLI:**
```powershell
supabase functions deploy incidents
supabase functions deploy community
```

---

### ✅ STEP 3: Test Your App

```powershell
npm run dev
```

Open browser:
- **Community Board** → Should show 5-6 posts
- **Incidents** → Should show 4 sample incidents
- **Report Incident** → Form should work (no errors)

---

## Why This Works

The fix creates an `is_admin()` function that bypasses Row Level Security (RLS), preventing the infinite loop that happened when policies checked the profiles table while inside a policy on the profiles table.

**Before:** Policy → Check profiles → Trigger profiles policy → Check profiles → ♾️ Infinite loop

**After:** Policy → Call is_admin() → Returns true/false → ✅ Done

---

## Still Not Working?

Open browser console (F12) and look for:
```
✅ Edge Function URL: https://your-project.supabase.co/functions/v1
✅ Supabase Client: Initialized
```

If you see ❌ errors, check:
1. Did you run ALL 5 SQL files in order?
2. Are Edge Functions deployed?
3. Is `.env` file correct? (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)

---

**Full details:** See `FIX_RECURSION_GUIDE.md`
