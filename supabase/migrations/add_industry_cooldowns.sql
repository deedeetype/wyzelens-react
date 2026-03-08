-- Migration: Add industry_cooldowns table to prevent delete/recreate bypass
-- Date: 2026-03-07 23:44 EST
-- Purpose: Track when users create scans for each industry to enforce cooldown periods

-- Create industry_cooldowns table
CREATE TABLE IF NOT EXISTS public.industry_cooldowns (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id TEXT NOT NULL,
  industry TEXT NOT NULL,
  last_scan_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One cooldown entry per user+industry combination
  CONSTRAINT unique_user_industry UNIQUE (user_id, industry),
  
  -- Foreign key to users table (CASCADE delete when user is deleted)
  CONSTRAINT industry_cooldowns_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(clerk_id) 
    ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_industry_cooldowns_user ON public.industry_cooldowns(user_id);
CREATE INDEX idx_industry_cooldowns_industry ON public.industry_cooldowns(industry);
CREATE INDEX idx_industry_cooldowns_last_scan ON public.industry_cooldowns(last_scan_created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.industry_cooldowns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own cooldowns
CREATE POLICY "Users can view own cooldowns"
  ON public.industry_cooldowns
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Service role can do everything (for backend functions)
CREATE POLICY "Service role has full access"
  ON public.industry_cooldowns
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comment
COMMENT ON TABLE public.industry_cooldowns IS 'Tracks when users create scans for each industry to enforce cooldown periods and prevent delete/recreate bypass';
COMMENT ON COLUMN public.industry_cooldowns.last_scan_created_at IS 'Timestamp of when the user last created a NEW scan (not refresh) for this industry';
