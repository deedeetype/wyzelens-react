-- Add CASCADE DELETE constraints to clean up related data when user is deleted
-- This ensures that when a user is deleted, all their scans, competitors, news, etc. are also removed

-- First, check existing foreign keys
-- You can see them in Supabase Dashboard > Database > Tables > Click on a table > Foreign Keys

-- Add ON DELETE CASCADE to related tables
-- (Adjust column names based on your actual schema)

-- Example for scans table
ALTER TABLE scans 
DROP CONSTRAINT IF EXISTS scans_user_id_fkey,
ADD CONSTRAINT scans_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for competitors table (if it has a user_id)
ALTER TABLE competitors 
DROP CONSTRAINT IF EXISTS competitors_user_id_fkey,
ADD CONSTRAINT competitors_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for news_feed table (if linked to user)
ALTER TABLE news_feed 
DROP CONSTRAINT IF EXISTS news_feed_user_id_fkey,
ADD CONSTRAINT news_feed_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for alerts table
ALTER TABLE alerts 
DROP CONSTRAINT IF EXISTS alerts_user_id_fkey,
ADD CONSTRAINT alerts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for insights table
ALTER TABLE insights 
DROP CONSTRAINT IF EXISTS insights_user_id_fkey,
ADD CONSTRAINT insights_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for user_subscriptions table
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey,
ADD CONSTRAINT user_subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for scan_schedules table
ALTER TABLE scan_schedules 
DROP CONSTRAINT IF EXISTS scan_schedules_user_id_fkey,
ADD CONSTRAINT scan_schedules_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for usage_tracking table
ALTER TABLE usage_tracking 
DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey,
ADD CONSTRAINT usage_tracking_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Example for refresh_logs table
ALTER TABLE refresh_logs 
DROP CONSTRAINT IF EXISTS refresh_logs_user_id_fkey,
ADD CONSTRAINT refresh_logs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Verify the changes
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
