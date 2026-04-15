-- Competitor Intelligence RLS Fix
-- Problem: Clerk JWT not available in current_setting('request.jwt.claims')
-- Solution: Disable RLS temporarily until Clerk JWT integration is properly configured

-- Disable RLS (temporary workaround)
ALTER TABLE competitor_intelligence DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON competitor_intelligence;
DROP POLICY IF EXISTS "Users can view their competitor intelligence" ON competitor_intelligence;
DROP POLICY IF EXISTS "Users can insert their competitor intelligence" ON competitor_intelligence;
DROP POLICY IF EXISTS "Users can update their competitor intelligence" ON competitor_intelligence;
DROP POLICY IF EXISTS "Users can delete their competitor intelligence" ON competitor_intelligence;

-- Note: RLS will be re-enabled once Clerk JWT template is configured in Clerk dashboard
-- See: https://clerk.com/docs/integrations/databases/supabase
