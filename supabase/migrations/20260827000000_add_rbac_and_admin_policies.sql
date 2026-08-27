-- =============================================
-- Migration: Add RBAC Columns & Admin RLS Policies
-- =============================================

-- 1. Add RBAC and Permissions columns to profiles if not already present
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{"attendance": true, "finance": true, "todo": true}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Set admin role for default administrator
UPDATE profiles 
SET role = 'admin',
    permissions = '{"attendance": true, "finance": true, "todo": true}'::jsonb,
    is_active = true
WHERE email = 'rusdiaristiawan@gmail.com' OR email = 'admin@worksphere.local';

-- 3. Update Row Level Security (RLS) policies on profiles table

-- Drop existing restrictive select policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles or users view own" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create permissive SELECT policy: Users can read their own profile, and Admins can read ALL profiles
CREATE POLICY "Admins can view all profiles or users view own" ON profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'rusdiaristiawan@gmail.com'
    OR (auth.jwt() ->> 'email') = 'admin@worksphere.local'
    OR EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles or users update own" ON profiles;

-- Create permissive UPDATE policy: Users can update their own profile, and Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles or users update own" ON profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'rusdiaristiawan@gmail.com'
    OR (auth.jwt() ->> 'email') = 'admin@worksphere.local'
    OR EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Ensure INSERT / UPSERT is allowed for authenticated users
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'rusdiaristiawan@gmail.com'
    OR (auth.jwt() ->> 'email') = 'admin@worksphere.local'
  );
