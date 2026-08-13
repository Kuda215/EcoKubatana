# 🎯 START HERE

## Your Complete Supabase Authentication Setup

---

## ⚠️ **SEEING "Invalid API key" ERROR?**

**You need to add your Supabase keys!**

👉 **[ADD_KEYS.md](ADD_KEYS.md)** ← Follow this step-by-step guide (5 minutes)

**Quick version:**
1. Create `.env` file in project root
2. Get keys from https://app.supabase.com → Settings → API
3. Add to `.env`:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run SQL from [ADD_KEYS.md](ADD_KEYS.md#step-4-run-the-sql-setup)
5. Restart server: `npm run dev`

---

## 📚 Available Guides

### 1️⃣ **[QUICKSTART.md](QUICKSTART.md)** ⚡
**5-minute quick commands** - Just want to get started fast? Start here.

### 2️⃣ **[CHECKLIST.md](CHECKLIST.md)** ✅
**Interactive checklist** - Follow step-by-step and check off as you go. **RECOMMENDED**

### 3️⃣ **[SETUP_GUIDE.md](SETUP_GUIDE.md)** 📖
**Detailed documentation** - Full explanations, SQL code, troubleshooting, and production tips.

---

## ⚡ Super Quick Start

If you just want commands to run:

```powershell
# Install Supabase
npm install @supabase/supabase-js

# Create environment file
Copy-Item .env.example .env
# (Now edit .env and add your Supabase keys)

# Go to Supabase Dashboard → SQL Editor
# Run the SQL from SETUP_GUIDE.md Step 4

# Start the app
npm run dev
```

Open http://localhost:5173 and test!

---

## 🔑 Where to Get Your Supabase Keys

1. Go to: https://app.supabase.com
2. Select your project
3. Click "Settings" (gear icon)
4. Click "API" in the left menu
5. Copy:
   - **Project URL** → Put in `VITE_SUPABASE_URL`
   - **anon public** key → Put in `VITE_SUPABASE_ANON_KEY`

---

## 📁 Files Created for You

All code is ready! These files have been created/updated:

✅ `src/lib/supabaseClient.js` - Supabase connection  
✅ `src/contexts/AuthContext.jsx` - Authentication logic  
✅ `src/components/Login.jsx` - Login/Register forms  
✅ `src/components/Login.css` - Styles updated  
✅ `.env.example` - Environment template  

---

## 🎯 What Works Now

Once set up, you'll have:

- ✅ User registration with email/password
- ✅ Login/logout functionality  
- ✅ Role-based access (Member/Volunteer/Admin)
- ✅ Protected Admin Portal
- ✅ User profiles in Supabase database
- ✅ Session management
- ✅ Password validation
- ✅ Error handling with user-friendly messages

---

## 🚨 Important Notes

1. **Environment Variables** - Must start with `VITE_` for Vite projects
2. **Email Confirmations** - Disable for testing (turn on for production)
3. **Restart Required** - After creating `.env`, restart dev server
4. **Passwords** - Minimum 6 characters required by Supabase
5. **Admin Access** - Role must be exactly 'admin' (lowercase) in database

---

## 🎉 Success Looks Like

When everything works:

1. Register a new user → See them in Supabase Dashboard
2. Login with that user → Stay logged in (refresh page, still logged in)
3. Create admin user → Can access Admin Portal
4. All animations work → Verify/Reject show green checkmark/red cross

---

## ❓ Having Issues?

Common fixes:

- ❌ Can't find `.env` → Must be in project root (same level as `package.json`)
- ❌ "Invalid credentials" → Check email/password, verify user exists
- ❌ "Access Denied" on Admin → Check role in database is 'admin'
- ❌ Registration fails → Check SQL was run in Supabase
- ❌ Environment vars not loading → Restart dev server

See [CHECKLIST.md](CHECKLIST.md) for full troubleshooting guide.

---

## 📞 Next Steps After Setup

1. Test all features thoroughly
2. Create test users for each role
3. Customize email templates in Supabase (optional)
4. Set up password reset flow (optional)
5. Configure production settings when ready to deploy

---

**Ready to begin?** → Open [CHECKLIST.md](CHECKLIST.md) and start checking boxes! ✅
