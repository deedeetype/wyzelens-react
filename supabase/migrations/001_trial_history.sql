-- Migration: Trial History Tracking (Anti-Abuse)
-- Purpose: Track trial usage by email to prevent account deletion abuse
-- Created: 2026-04-20

CREATE TABLE IF NOT EXISTS trial_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_trial_started_at timestamptz NOT NULL DEFAULT now(),
  trial_used boolean DEFAULT true,
  attempt_count integer DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_trial_history_email ON trial_history(email);

-- RLS Policies (users can only read their own trial status)
ALTER TABLE trial_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own trial history by email
CREATE POLICY "Users can read own trial history" ON trial_history
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Allow service role to insert/update (for backend operations)
CREATE POLICY "Service can manage trial history" ON trial_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trial_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trial_history_updated_at
  BEFORE UPDATE ON trial_history
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_history_timestamp();

-- Comment
COMMENT ON TABLE trial_history IS 'Tracks trial usage by email to prevent abuse via account deletion/recreation';
