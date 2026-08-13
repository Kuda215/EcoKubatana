# 🔧 LOCAL MODE - Test Without Supabase

## ✅ You're Already Running in Local Mode!

Your app automatically detected that Supabase keys are not configured and switched to **LOCAL MODE**. This means you can test everything right now without any setup!

---

## 🎯 How to Test Locally

### 1. Start the App (if not already running)
```powershell
npm run dev
```

### 2. Register a New User
- Click **"Create Account"**
- Select any role (Member/Volunteer/Admin)
- Fill in the form with any test data:
  - Name: Test User
  - Email: test@example.com
  - Password: test123 (or anything 6+ characters)
  - Phone: +27 11 123 4567
  - Location: Johannesburg
- Click **"Join EcoKubatana"**
- ✅ You're now logged in!

### 3. Test Login
- Logout (if needed)
- Click **"Sign In"**
- Enter ANY email and password
- ✅ In local mode, login always succeeds and gives you **admin access**

### 4. Test All Features
Since you're logged in as admin in local mode, you can:
- ✅ Access Admin Portal (all buttons work!)
- ✅ View/Verify/Reject with animations
- ✅ Post on Community Board
- ✅ Like and comment on posts
- ✅ Change settings
- ✅ Everything works!

---

## 📊 How Local Mode Works

**Local Mode:**
- Stores users in browser localStorage (not a real database)
- No passwords are checked (any password works)
- Always gives admin role on login (so you can test everything)
- Perfect for UI/UX testing and development
- No network calls, instant responses

**Supabase Mode:**
- Real authentication with email/password
- Users stored in Supabase database
- Role-based access control
- Persistent across devices
- Production-ready

---

## 🔄 Switch to Supabase Mode

When ready to use real authentication:

1. **Get Supabase Keys:**
   - Go to https://app.supabase.com
   - Create project (or use existing)
   - Get URL and ANON KEY from Settings → API

2. **Create `.env` file:**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Add your keys to `.env`:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run the SQL:**
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL from [SETUP_GUIDE.md](SETUP_GUIDE.md)

5. **Restart dev server:**
   ```powershell
   # Stop current server (Ctrl+C)
   npm run dev
   ```

6. **App will automatically switch to Supabase mode!**

---

## 🎨 Visual Indicators

### Local Mode:
- Blue badge at top: **"🔧 LOCAL MODE - No Supabase required"**
- Console shows: `🔧 Running in LOCAL mode`
- Loading screen shows: "Running in LOCAL mode"

### Supabase Mode:
- No badge shown (normal mode)
- Console shows: `🔧 Running in SUPABASE mode`
- Real authentication required

---

## 🧪 Test Scenarios in Local Mode

### Test User Registration:
1. Register as "Member" → Works ✅
2. Logout and login → Still member role ✅
3. Close browser and reopen → Still logged in ✅

### Test Admin Features:
- Just sign in (always admin in local mode)
- Access Admin Portal → Full access ✅
- Click "Verify" button → Green checkmark animation ✅
- Click "Reject" button → Red cross animation ✅
- View reports → Modal opens ✅

### Test Community Board:
- Create a post → Appears in feed ✅
- Like a post → Counter updates ✅
- Add comment → Shows immediately ✅
- Filter by category → Works ✅

---

## 💡 Pro Tips

**For Demo/Testing:**
- Local mode is perfect! No setup needed.
- Great for showing clients or testing UI
- Fast development without network delays

**For Production:**
- Switch to Supabase mode
- Real users, real security
- Scalable and professional

**During Development:**
- Use local mode for rapid UI testing
- Use Supabase mode for integration testing
- Both modes work identically (same API)

---

## 🐛 Troubleshooting Local Mode

### Data not persisting?
- Check browser localStorage (F12 → Application → Local Storage)
- Clear cache if issues: `localStorage.clear()`

### Want to reset?
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('ecokubatana_user')
// Then refresh page
```

### Switch between modes?
- Local → Supabase: Add keys to `.env`, restart
- Supabase → Local: Remove `.env`, restart

---

## 🎉 You're All Set!

**Local Mode is active and working!** You can now:

1. Test the entire application
2. Show demos to stakeholders
3. Develop and test UI changes
4. Verify all features work

**No Supabase setup needed until you're ready for production!**

---

**When ready for real authentication:** → Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)
