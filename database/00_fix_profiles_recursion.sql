-- ============================================
-- FIX INFINITE RECURSION IN PROFILES TABLE
-- ============================================
-- Run this FIRST before other database scripts
-- This fixes the "infinite recursion detected in policy for relation profiles" error

-- ─────────────────────────────────────────────
-- 1. CREATE PROFILES TABLE IF NOT EXISTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  location TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. DROP ALL EXISTING POLICIES ON PROFILES
-- ─────────────────────────────────────────────
-- This prevents infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 3. CREATE SIMPLE NON-RECURSIVE POLICIES
-- ─────────────────────────────────────────────
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile (NO recursion - uses auth.uid() directly)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile (NO recursion)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (NO recursion)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow reading basic profile info for community features (NO recursion)
-- This allows other tables to read profile.name and profile.role without triggering recursion
CREATE POLICY "Public profiles viewable"
  ON profiles FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────
-- 4. CREATE HELPER FUNCTION FOR ADMIN CHECK
-- ─────────────────────────────────────────────
-- This function uses SECURITY DEFINER to bypass RLS and prevent recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ─────────────────────────────────────────────
-- 5. CREATE AUTO-PROFILE CREATION TRIGGER
-- ─────────────────────────────────────────────
-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- ─────────────────────────────────────────────
-- 6. CREATE UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ─────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────
-- Check if policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
