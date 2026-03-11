-- Migration: Add is_watchlist flag to competitors table
-- Date: 2026-03-11
-- Purpose: Track which competitors were added via user watchlist vs auto-discovered

-- Add column (safe - defaults to false for existing rows)
ALTER TABLE competitors 
ADD COLUMN IF NOT EXISTS is_watchlist BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_competitors_watchlist 
ON competitors(scan_id, is_watchlist);

-- Add comment
COMMENT ON COLUMN competitors.is_watchlist IS 
'TRUE if competitor was manually added via user watchlist, FALSE if auto-discovered by AI';
