-- Above + Inside: Security Hardening
-- Migration 002 — applied 2026-03-15
-- Hardens RLS policies, trigger function, schema fixes, and adds indexes.

-- ============================================================
-- 1. SAFER handle_new_user() TRIGGER
--    Uses COALESCE + existence check to prevent duplicate inserts
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke EXECUTE from PUBLIC, anon, authenticated (only the function owner / postgres should run it)
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM authenticated;

-- ============================================================
-- 2. SCHEMA FIXES
-- ============================================================

-- sessions.frameworks_used: use explicit empty array default
ALTER TABLE sessions ALTER COLUMN frameworks_used SET DEFAULT ARRAY[]::text[];

-- birth_profiles.birth_timezone: cast to TEXT (was DOUBLE PRECISION)
ALTER TABLE birth_profiles ALTER COLUMN birth_timezone TYPE TEXT USING birth_timezone::text;

-- Unify "cancelled" → "canceled" in sessions status CHECK constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('scheduled', 'active', 'completed', 'canceled'));

-- ============================================================
-- 3. DROP OLD BROAD RLS POLICIES
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- birth_profiles
DROP POLICY IF EXISTS "Users can CRUD own birth profiles" ON birth_profiles;
DROP POLICY IF EXISTS "Practitioners can view client profiles" ON birth_profiles;

-- practitioner_clients
DROP POLICY IF EXISTS "Practitioners manage own clients" ON practitioner_clients;

-- sessions
DROP POLICY IF EXISTS "Practitioners manage own sessions" ON sessions;

-- family_constellations
DROP POLICY IF EXISTS "Users manage own constellations" ON family_constellations;

-- shared_charts
DROP POLICY IF EXISTS "Owners manage shared charts" ON shared_charts;
DROP POLICY IF EXISTS "Public can view shared charts" ON shared_charts;

-- subscriptions
DROP POLICY IF EXISTS "Users view own subscriptions" ON subscriptions;

-- ============================================================
-- 4. EXPLICIT RLS POLICIES (SELECT / INSERT / UPDATE / DELETE)
--    Uses (SELECT auth.uid()) to avoid per-row function re-evaluation
-- ============================================================

-- profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (id = (SELECT auth.uid()));

-- birth_profiles (own)
CREATE POLICY "birth_profiles_select_own" ON birth_profiles
  FOR SELECT USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "birth_profiles_insert_own" ON birth_profiles
  FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "birth_profiles_update_own" ON birth_profiles
  FOR UPDATE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "birth_profiles_delete_own" ON birth_profiles
  FOR DELETE USING (owner_id = (SELECT auth.uid()));

-- birth_profiles (practitioners can read their clients' profiles)
CREATE POLICY "birth_profiles_select_practitioner" ON birth_profiles
  FOR SELECT USING (
    id IN (
      SELECT birth_profile_id FROM practitioner_clients
      WHERE practitioner_id = (SELECT auth.uid())
    )
  );

-- practitioner_clients
CREATE POLICY "prac_clients_select" ON practitioner_clients
  FOR SELECT USING (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "prac_clients_insert" ON practitioner_clients
  FOR INSERT WITH CHECK (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "prac_clients_update" ON practitioner_clients
  FOR UPDATE USING (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "prac_clients_delete" ON practitioner_clients
  FOR DELETE USING (practitioner_id = (SELECT auth.uid()));

-- sessions
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT USING (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (practitioner_id = (SELECT auth.uid()));
CREATE POLICY "sessions_delete" ON sessions
  FOR DELETE USING (practitioner_id = (SELECT auth.uid()));

-- family_constellations
CREATE POLICY "constellations_select" ON family_constellations
  FOR SELECT USING (
    birth_profile_id IN (
      SELECT id FROM birth_profiles WHERE owner_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "constellations_insert" ON family_constellations
  FOR INSERT WITH CHECK (
    birth_profile_id IN (
      SELECT id FROM birth_profiles WHERE owner_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "constellations_update" ON family_constellations
  FOR UPDATE USING (
    birth_profile_id IN (
      SELECT id FROM birth_profiles WHERE owner_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "constellations_delete" ON family_constellations
  FOR DELETE USING (
    birth_profile_id IN (
      SELECT id FROM birth_profiles WHERE owner_id = (SELECT auth.uid())
    )
  );

-- shared_charts (owner manages)
CREATE POLICY "shared_charts_select_own" ON shared_charts
  FOR SELECT USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "shared_charts_insert_own" ON shared_charts
  FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "shared_charts_update_own" ON shared_charts
  FOR UPDATE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "shared_charts_delete_own" ON shared_charts
  FOR DELETE USING (owner_id = (SELECT auth.uid()));

-- shared_charts (public read for non-expired — note: no auth required)
-- WARNING: any non-expired chart is readable by anyone who knows the row exists.
-- For true token-gated access, replace with a security-definer RPC function.
CREATE POLICY "shared_charts_public_select" ON shared_charts
  FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());

-- subscriptions
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "subscriptions_insert" ON subscriptions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "subscriptions_update" ON subscriptions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 5. ADDITIONAL INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_prac_clients_birth_profile ON practitioner_clients(birth_profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_practitioner_date ON sessions(practitioner_id, session_date);
