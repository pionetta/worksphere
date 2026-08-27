-- =============================================
-- Migration: Add RBAC Columns & Supabase RLS Policies
-- =============================================

-- 1. Tambahkan kolom role, permissions, dan is_active ke tabel profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{"attendance": true, "finance": true, "todo": true}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Tetapkan role admin untuk akun rusdiaristiawan@gmail.com
UPDATE profiles 
SET role = 'admin',
    permissions = '{"attendance": true, "finance": true, "todo": true}'::jsonb,
    is_active = true
WHERE email = 'rusdiaristiawan@gmail.com';

-- 3. Hapus policy lama yang membatasi SELECT
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles or users view own" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;

-- 4. Buat policy SELECT baru: Semua user yang login (termasuk Admin) bisa membaca profil
CREATE POLICY "Allow authenticated users to read profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- 5. Hapus policy lama yang membatasi UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles or users update own" ON profiles;
DROP POLICY IF EXISTS "Allow users update own or admin update all" ON profiles;

-- 6. Buat policy UPDATE baru: User bisa update profil sendiri, Admin bisa update semua user
CREATE POLICY "Allow users update own or admin update all" ON profiles
  FOR UPDATE TO authenticated USING (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'rusdiaristiawan@gmail.com'
  );

-- 7. Pastikan policy INSERT aktif
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profile" ON profiles;

CREATE POLICY "Allow authenticated insert profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'rusdiaristiawan@gmail.com'
  );
