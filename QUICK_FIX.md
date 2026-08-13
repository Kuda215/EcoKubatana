# 🚀 QUICK SETUP - 2 Minutes

## Getting "Invalid API key"? Here's the fix:

---

## **1. Get Your Keys (30 seconds)**

Go to: **https://app.supabase.com** → Your Project → **Settings** → **API**

Copy these 2 values:
- ✅ **Project URL** 
- ✅ **anon public** key

---

## **2. Create `.env` File (30 seconds)**

In your project folder (where `package.json` is), create file named `.env`

**PowerShell command:**
```powershell
New-Item .env -ItemType File
```

---

## **3. Paste Keys (30 seconds)**

Open `.env` and paste:

```env
VITE_SUPABASE_URL=paste-your-project-url-here
VITE_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

---

## **4. Run SQL (30 seconds)**

Go to Supabase Dashboard → **SQL Editor** → Copy/paste this:

```sql
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Click **RUN**

---

## **5. Disable Email Confirmation (30 seconds)**

Supabase Dashboard → **Authentication** → **Settings** → Turn OFF "Enable email confirmations" → **Save**

---

## **6. Restart Server (5 seconds)**

```powershell
# Stop current server: Ctrl+C
npm run dev
```

---

## ✅ **Done! Now test:**

1. Go to your app
2. Click "Create Account"  
3. Fill in form (password 6+ chars)
4. Register!

---

**Still having issues?** → See [ADD_KEYS.md](ADD_KEYS.md) for detailed troubleshooting
