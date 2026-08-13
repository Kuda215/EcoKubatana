# 📋 Implementation Checklist

Follow these steps in order. Check off each one as you complete it.

---

## ✅ PHASE 1: Installation & Setup (5 minutes)

- [ ] **1.1** Open terminal in project folder
- [ ] **1.2** Run: `npm install @supabase/supabase-js`
- [ ] **1.3** Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`)
- [ ] **1.4** Get Supabase keys from: https://app.supabase.com/project/_/settings/api
- [ ] **1.5** Paste keys into `.env` file
  - Replace `VITE_SUPABASE_URL` with your project URL
  - Replace `VITE_SUPABASE_ANON_KEY` with your anon key

---

## ✅ PHASE 2: Database Setup (3 minutes)

- [ ] **2.1** Go to Supabase Dashboard: https://app.supabase.com
- [ ] **2.2** Select your project
- [ ] **2.3** Click "SQL Editor" in left sidebar
- [ ] **2.4** Copy the SQL from [SETUP_GUIDE.md](SETUP_GUIDE.md) (Step 4)
- [ ] **2.5** Paste and click "Run"
- [ ] **2.6** Verify: Go to "Table Editor" → should see "profiles" table

---

## ✅ PHASE 3: Configure Email (2 minutes)

**For Testing (Recommended):**
- [ ] **3.1** Go to Authentication → Settings
- [ ] **3.2** Find "Enable email confirmations"
- [ ] **3.3** Turn it OFF (for testing only)

**For Production (Later):**
- [ ] Set up email templates
- [ ] Turn ON email confirmations
- [ ] Configure SMTP settings

---

## ✅ PHASE 4: Test Run (5 minutes)

- [ ] **4.1** Run: `npm run dev`
- [ ] **4.2** Open browser to: http://localhost:5173
- [ ] **4.3** Test Registration:
  - Click "Create Account"
  - Choose "Admin" role
  - Fill in all fields (use a real email format)
  - Password must be 6+ characters
  - Click "Join EcoKubatana"
  
- [ ] **4.4** Verify in Supabase:
  - Go to Authentication → Users
  - You should see your new user
  - Go to Table Editor → profiles
  - You should see your profile with role='admin'

- [ ] **4.5** Test Login:
  - Logout (if needed)
  - Click "Sign In"
  - Enter email & password
  - Should be logged in successfully

- [ ] **4.6** Test Admin Portal:
  - Navigate to Admin Portal
  - Should see dashboard (not "Access Denied")
  - Test "View" button → Modal opens
  - Test "Verify" button → Green checkmark animation
  - Test "Reject" button → Red cross animation

---

## ✅ PHASE 5: Create Test Users (Optional)

Create 3 test users with different roles:

**Admin User:**
- [ ] Email: admin@ecokubatana.test
- [ ] Password: admin123
- [ ] Role: admin

**Volunteer User:**
- [ ] Email: volunteer@ecokubatana.test
- [ ] Password: volunteer123
- [ ] Role: volunteer

**Member User:**
- [ ] Email: member@ecokubatana.test
- [ ] Password: member123
- [ ] Role: member

After creating, manually update roles in Supabase:
- Go to Table Editor → profiles
- Click on each user and set the correct role

---

## ✅ PHASE 6: Feature Testing

Test each feature:

- [ ] **Dashboard** - View stats, quick actions work
- [ ] **Community Board** 
  - Create post with category
  - Like/unlike posts
  - Add comments
  - Filter by category
- [ ] **Admin Portal** (admin only)
  - View reports
  - Verify/reject with animations
  - Manage members
  - Send alerts
- [ ] **Learning Hub** - View resources
- [ ] **Take Action** - See action cards
- [ ] **Settings** - Update profile

---

## ✅ Common Issues & Fixes

### ❌ "Missing Supabase environment variables"
- Check `.env` exists in project root
- Variables must start with `VITE_`
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### ❌ "Invalid login credentials"
- Check email/password are correct
- Verify user exists in Supabase Dashboard

### ❌ "Email not confirmed"
- Go to Supabase → Authentication → Settings
- Turn OFF "Enable email confirmations"

### ❌ "Cannot access Admin Portal"
- Check user role in Supabase → Table Editor → profiles
- Role must be exactly 'admin' (lowercase)

### ❌ Registration not working
- Check Supabase SQL was run correctly
- Verify "profiles" table exists
- Check browser console for errors

---

## 🎉 Success Criteria

You're done when:

✅ You can register new users  
✅ You can login with email/password  
✅ Admin users can access Admin Portal  
✅ All buttons work (View/Verify/Reject with animations)  
✅ Community Board posts work  
✅ No console errors  

---

## 📞 Need Help?

1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for details
4. Check Supabase logs: Dashboard → Logs
5. Verify all environment variables are set correctly

---

**Need to start over?**
Delete all users in Supabase → Authentication → Users and try again.
