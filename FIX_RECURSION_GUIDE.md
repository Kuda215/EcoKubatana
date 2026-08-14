# 🔧 COMPLETE DATABASE SETUP - FIX INFINITE RECURSION

## ⚠️ PROBLEM
You're seeing this error:
```
{
    "code": "42P17",
    "details": null,
    "hint": null,
    "message": "infinite recursion detected in policy for relation \"profiles\""
}
```

## ✅ SOLUTION
Run the SQL files in the **exact order** below in your Supabase SQL Editor.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### 1. **Go to Supabase Dashboard**
   - Open your project: https://app.supabase.com
   - Navigate to **SQL Editor** in the left sidebar

---

### 2. **Run SQL Files in This Order**

#### **File 1: Fix Profiles Recursion (MUST RUN FIRST)**
Copy the **entire contents** of:
```
database/00_fix_profiles_recursion.sql
```
Paste into SQL Editor and click **RUN** ▶️

**What this does:**
- Fixes the infinite recursion error
- Creates profiles table with proper RLS policies
- Creates `is_admin()` helper function
- Sets up auto-profile creation on signup

⏱️ Wait for "Success. No rows returned" message

---

#### **File 2: Incidents Schema**
Copy the **entire contents** of:
```
database/01_incidents_schema.sql
```
Paste into SQL Editor and click **RUN** ▶️

**What this does:**
- Creates incidents table
- Sets up RLS policies (now using is_admin() - no recursion!)
- Creates helper functions for verify/reject/resolve

⏱️ Wait for success message

---

#### **File 3: Incidents Seed Data**
Copy the **entire contents** of:
```
database/02_incidents_seed_data.sql
```
Paste into SQL Editor and click **RUN** ▶️

**What this does:**
- Inserts 4 sample incidents
- Helps you test the system immediately

⏱️ Wait for success message

---

#### **File 4: Community Schema**
Copy the **entire contents** of:
```
database/03_community_schema.sql
```
Paste into SQL Editor and click **RUN** ▶️

**What this does:**
- Creates community board tables
- Sets up RLS policies (now using is_admin() - no recursion!)
- Creates triggers for auto-counting

⏱️ Wait for success message

---

#### **File 5: Community Seed Data**
Copy the **entire contents** of:
```
database/04_community_seed_data.sql
```
Paste into SQL Editor and click **RUN** ▶️

**What this does:**
- Creates default "EcoKubatana Zimbabwe" community
- Inserts 5-6 sample posts
- Creates welcome message

⏱️ Wait for success message

---

### 3. **Verify Setup**

Run this query in SQL Editor to check everything is working:

```sql
-- Check if tables exist
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should show:
-- ✅ communities
-- ✅ community_members
-- ✅ community_posts
-- ✅ comment_likes
-- ✅ incidents
-- ✅ post_comments
-- ✅ post_likes
-- ✅ profiles

-- Check if is_admin() function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- Check policies on profiles (should be simple, non-recursive)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

---

### 4. **Deploy Edge Functions**

Now that the database is fixed, deploy your Edge Functions:

#### **Option A: Via Supabase Dashboard (Easiest)**

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name: `incidents`
4. Copy code from `supabase/functions/incidents/index.ts`
5. Paste and click **Deploy**

Repeat for:
- Function name: `community`
- Code from: `supabase/functions/community/index.ts`

#### **Option B: Via CLI**

```powershell
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link project (get ref from Settings > API)
supabase link --project-ref your-project-ref

# Deploy both functions
supabase functions deploy incidents
supabase functions deploy community
```

---

### 5. **Test Your App**

1. Open your app: `npm run dev`
2. Navigate to **Community Board** - should load posts
3. Navigate to **Incidents** - should load sample incidents
4. Try creating a post - should work!
5. Check browser console (F12) - should see:
   ```
   🔧 API Configuration:
     VITE_SUPABASE_URL: https://your-project.supabase.co
     Edge Function URL: https://your-project.supabase.co/functions/v1
     Supabase Client: Initialized ✅
   
   Fetching community posts from: https://...
   Fetching incidents from: https://...
   ```

---

## 🎯 WHAT FIXED THE INFINITE RECURSION?

### Before (❌ Caused Recursion):
```sql
-- This checked profiles table FROM a policy ON profiles table
CREATE POLICY "Admins can view all incidents"
  ON incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles  -- ⚠️ Reading profiles...
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### After (✅ No Recursion):
```sql
-- Created a SECURITY DEFINER function that bypasses RLS
CREATE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ✅ Bypasses RLS!

-- Now policies use the function
CREATE POLICY "Admins can view all incidents"
  ON incidents FOR SELECT
  USING (is_admin());  -- ✅ No recursion!
```

---

## 🔍 TROUBLESHOOTING

### "Function is_admin() does not exist"
- Make sure you ran `00_fix_profiles_recursion.sql` FIRST
- Check if function exists: `SELECT * FROM pg_proc WHERE proname = 'is_admin';`

### "Still getting infinite recursion"
- Drop all policies on profiles: 
  ```sql
  DROP POLICY IF EXISTS "profile_name" ON profiles;
  ```
- Re-run `00_fix_profiles_recursion.sql`

### "Community board still empty"
- Check browser console for exact error
- Verify Edge Functions are deployed
- Check if seed data was inserted: `SELECT COUNT(*) FROM community_posts;`

### "No posts showing up"
- Check if community exists: `SELECT * FROM communities;`
- Check if seed data inserted: `SELECT * FROM community_posts;`
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'community_posts';`

---

## ✅ SUCCESS CHECKLIST

- [ ] Ran `00_fix_profiles_recursion.sql`
- [ ] Ran `01_incidents_schema.sql`
- [ ] Ran `02_incidents_seed_data.sql`
- [ ] Ran `03_community_schema.sql`
- [ ] Ran `04_community_seed_data.sql`
- [ ] Deployed `incidents` Edge Function
- [ ] Deployed `community` Edge Function
- [ ] Verified tables exist (8 tables total)
- [ ] `is_admin()` function exists
- [ ] Community Board shows posts
- [ ] Incidents page shows sample incidents
- [ ] No infinite recursion errors in browser console

---

## 🎉 YOU'RE DONE!

Your EcoKubatana app should now be fully functional with:
- ✅ No infinite recursion errors
- ✅ Community Board with posts
- ✅ Incident reporting system
- ✅ Admin capabilities
- ✅ Proper RLS security

Need help? Check browser console (F12) for detailed error messages.
