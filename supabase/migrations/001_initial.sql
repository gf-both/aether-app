-- Above + Inside: Database Schema
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/zsnnmgdebebqkmntgcss/sql/new

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'explorer', 'practitioner')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'trialing')),
  stripe_customer_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- BIRTH PROFILES (cosmic data for any person)
-- ============================================================
CREATE TABLE IF NOT EXISTS birth_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Me',
  full_name TEXT NOT NULL,
  birth_date DATE,
  birth_time TIME,
  birth_city TEXT,
  birth_lat DOUBLE PRECISION,
  birth_lon DOUBLE PRECISION,
  birth_timezone DOUBLE PRECISION,
  is_primary BOOLEAN DEFAULT FALSE,
  -- Quiz results
  enneagram_type INTEGER CHECK (enneagram_type BETWEEN 1 AND 9),
  enneagram_wing TEXT,
  mbti_type TEXT,
  dosha_type TEXT,
  archetype_type TEXT,
  love_language TEXT,
  -- Notes (private)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRACTITIONER CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS practitioner_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending')),
  session_rate DECIMAL(10,2),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SESSIONS (practitioner sessions with clients)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT,
  ai_analysis JSONB,
  action_items JSONB DEFAULT '[]'::jsonb,
  frameworks_used TEXT[] DEFAULT '{}',
  revenue DECIMAL(10,2),
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAMILY CONSTELLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS family_constellations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'sibling', 'partner', 'child', 'grandparent', 'other')),
  hd_type TEXT,
  birth_date DATE,
  notes TEXT,
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHARED CHARTS (shareable read-only links)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64url'),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS (Stripe mirror)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('explorer', 'practitioner')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'trialing', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users see/edit only their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Birth profiles: users see only their own
CREATE POLICY "Users can CRUD own birth profiles" ON birth_profiles FOR ALL USING (auth.uid() = owner_id);

-- Practitioners can see their clients' birth profiles
CREATE POLICY "Practitioners can view client profiles" ON birth_profiles FOR SELECT
  USING (
    id IN (
      SELECT birth_profile_id FROM practitioner_clients
      WHERE practitioner_id = auth.uid()
    )
  );

-- Practitioner clients: practitioners manage their own client list
CREATE POLICY "Practitioners manage own clients" ON practitioner_clients FOR ALL USING (auth.uid() = practitioner_id);

-- Sessions: practitioners see their own sessions
CREATE POLICY "Practitioners manage own sessions" ON sessions FOR ALL USING (auth.uid() = practitioner_id);

-- Family constellations: follow birth profile ownership
CREATE POLICY "Users manage own constellations" ON family_constellations FOR ALL
  USING (
    birth_profile_id IN (
      SELECT id FROM birth_profiles WHERE owner_id = auth.uid()
    )
  );

-- Shared charts: owner manages, anyone with token can view
CREATE POLICY "Owners manage shared charts" ON shared_charts FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public can view shared charts" ON shared_charts FOR SELECT USING (
  expires_at IS NULL OR expires_at > NOW()
);

-- Subscriptions: users see own
CREATE POLICY "Users view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_birth_profiles_owner ON birth_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_birth_profiles_primary ON birth_profiles(owner_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_sessions_practitioner ON sessions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_profile ON sessions(birth_profile_id);
CREATE INDEX IF NOT EXISTS idx_prac_clients_practitioner ON practitioner_clients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_shared_charts_token ON shared_charts(token);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_birth_profiles_updated_at BEFORE UPDATE ON birth_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
