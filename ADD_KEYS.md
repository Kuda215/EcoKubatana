# 🔑 Add Your Supabase Keys

## You're seeing "Invalid API key" because Supabase keys are not configured yet.

---

## ✅ **STEP 1: Create `.env` File**

In your project root folder (same level as `package.json`), create a file named `.env`

**Windows PowerShell:**
```powershell
New-Item .env -ItemType File
```

**Or manually:** Right-click in project folder → New → Text Document → Rename to `.env` (remove .txt extension)

---

## ✅ **STEP 2: Get Your Supabase Keys**

1. Go to: **https://app.supabase.com**
2. Click your project (or create one if needed)
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API**
5. You'll see two keys:
   - **Project URL** (looks like: `https://abcdefg.supabase.co`)
   - **anon public** (long key starting with `eyJ...`)

---

## ✅ **STEP 3: Add Keys to `.env` File**

Open the `.env` file you created and paste these two lines:

```env
VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

**⚠️ IMPORTANT:**
- Replace with YOUR actual values from Supabase Dashboard
- NO quotes needed around the values
- NO spaces around the `=` sign
- Make sure it says `VITE_` at the start (required for Vite)

**Example of correct .env file:**
```env
VITE_SUPABASE_URL=https://xyzproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQyMTIwMCwiZXhwIjoxOTU0OTk3MjAwfQ.abc123def456
```

---

## ✅ **STEP 4: Run the SQL Setup**

Go back to Supabase Dashboard:

1. Click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'volunteer', 'admin')),
  location TEXT,
  phone TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **RUN** (bottom right)
5. Should see "Success. No rows returned"

---

## ✅ **STEP 5: Disable Email Confirmation (For Testing)**

Still in Supabase Dashboard:

1. Click **Authentication** in left sidebar
2. Click **Settings** 
3. Scroll to **Email Auth**
4. Turn **OFF** "Enable email confirmations"
5. Click **Save**

(You can turn this back ON for production)

---

## ✅ **STEP 6: Restart Your Dev Server**

Stop your current server (**Ctrl+C** in terminal), then:

```powershell
npm run dev
```

---

## 🎉 **STEP 7: Test It!**

Open your browser (should auto-reload):

1. **Register:** Click "Create Account"
   - Choose "Admin" role
   - Fill in form (use real email format, password 6+ chars)
   - Click "Join EcoKubatana"
   
2. **Check Supabase:** 
   - Go to Dashboard → Authentication → Users
   - You should see your new user!

3. **Login:** Try logging in with email/password

4. **Admin Portal:** Should have full access now!

---

## ❌ **Troubleshooting**

### Still seeing "Invalid API key"?
- Check `.env` file is in the correct folder (project root, next to `package.json`)
- Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check no extra spaces or quotes
- Restart dev server after changes

### Can't register?
- Did you run the SQL in Supabase? (Step 4)
- Check Supabase Dashboard → Table Editor → should see "profiles" table

### Email confirmation issues?
- Disable email confirmations (Step 5)
- Or check your email for confirmation link

### Need to see errors?
- Open browser console (F12)
- Check terminal for server errors

---

## 📁 **File Locations:**

```
EcoKubatana/
├── .env                  ← Create this file here
├── package.json          ← Should be at same level
├── vite.config.js
└── src/
    └── ...
```

---

## 🔒 **Security Note:**

- ✅ `.env` is in `.gitignore` (won't be committed to Git)
- ✅ Never share your `.env` file
- ✅ Never commit Supabase keys to GitHub
- ✅ Use environment variables in production

---

**Need more help?** Check the browser console (F12) for detailed error messages!
