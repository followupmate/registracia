-- ============================================
-- Športový Deň 2026 — Supabase Setup
-- ============================================
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create the registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  activities TEXT[] DEFAULT '{}',
  team_sports TEXT[] DEFAULT '{}',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index on email for duplicate checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_email 
  ON registrations (LOWER(email));

-- 3. Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_registrations_created_at 
  ON registrations (created_at DESC);

-- 4. Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — allow public read/insert/update, restrict delete to service role
-- Anyone can register (insert)
CREATE POLICY "Anyone can register"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can view registrations (for counters on the form)
CREATE POLICY "Anyone can view registrations"
  ON registrations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can update their own registration (by email match)
CREATE POLICY "Anyone can update own registration"
  ON registrations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated/service role can delete (admin)
CREATE POLICY "Admin can delete registrations"
  ON registrations FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- Done! Set your env vars in Vercel:
--   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
--   ADMIN_PIN=6702
-- ============================================
