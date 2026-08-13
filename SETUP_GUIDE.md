# 🚀 EcoKubatana Setup Guide - Supabase Authentication

## Step-by-Step Implementation

---

## **STEP 1: Install Supabase Client**

Open your terminal in the project folder and run:

```powershell
npm install @supabase/supabase-js
```

---

## **STEP 2: Create Environment File**

Create a file named `.env` in your project root folder:

**File: `.env`**
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**👉 Replace with your actual Supabase keys**

Example:
```env
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **STEP 3: Create Supabase Client File**

Create a new file: `src/lib/supabaseClient.js`

This file will be created automatically in the next step.

---

## **STEP 4: Setup Supabase Database Tables**

Go to your Supabase Dashboard → SQL Editor and run this SQL:

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

---

## **STEP 5: Update Project Files**

Run the following commands in order. Each file will be created/updated:

### 5.1 - Create Supabase Client
### 5.2 - Update AuthContext
### 5.3 - Update Login Component

**These files will be created automatically when you confirm.**

---

## **STEP 6: Configure Email Settings (IMPORTANT)**

Go to Supabase Dashboard:
1. Click **Authentication** → **Email Templates**
2. Enable "Confirm signup" (or disable email confirmation for testing)
3. For development, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Turn OFF "Enable email confirmations"

---

## **STEP 7: Start Development Server**

```powershell
npm run dev
```

---

## **STEP 8: Test Authentication Flow**

### Testing Registration:
1. Click "Create Account"
2. Select role (Member/Volunteer/Admin)
3. Fill in: Name, Email, Password, Phone, Location
4. Click "Join EcoKubatana"
5. Check Supabase Dashboard → Authentication → Users

### Testing Sign In:
1. Click "Sign In"
2. Select role toggle (Member/Volunteer/Admin)
3. Enter email and password
4. Click "Sign In"

### Testing Admin Portal:
1. Sign in with admin role
2. Navigate to Admin Portal
3. Verify all features work (View, Verify, Reject buttons with animations)

---

## **TROUBLESHOOTING**

### ❌ "Invalid login credentials"
- Check email/password are correct
- Verify user exists in Supabase Dashboard → Authentication → Users

### ❌ "Email not confirmed"
- Go to Supabase Dashboard → Authentication → Settings
- Disable "Enable email confirmations" for testing

### ❌ Environment variables not found
- Make sure `.env` file is in project root
- Variables must start with `VITE_`
- Restart dev server after creating `.env`

### ❌ Can't access Admin Portal
- Check user role in profiles table
- Role must be exactly 'admin' (lowercase)

---

## **NEXT STEPS**

After authentication works:

1. ✅ Test all user roles (member, volunteer, admin)
2. ✅ Test Community Board posting
3. ✅ Test Admin Portal actions (Verify/Reject with animations)
4. ✅ Set up email templates in Supabase (optional)
5. ✅ Configure production settings when ready to deploy

---

## **Production Checklist**

Before going live:

- [ ] Enable email confirmations
- [ ] Set up custom email templates
- [ ] Add password reset flow
- [ ] Configure custom domain
- [ ] Set up proper RLS policies
- [ ] Enable MFA (Multi-Factor Authentication)
- [ ] Review and test all security policies

---

## 🎉 You're All Set!

Your EcoKubatana platform now has full authentication with:
- ✅ User registration with roles
- ✅ Login/Logout with role selection
- ✅ Protected routes (Admin Portal)
- ✅ User profiles stored in Supabase
- ✅ Real-time session management

**Need help?** Check the Supabase docs: https://supabase.com/docs
