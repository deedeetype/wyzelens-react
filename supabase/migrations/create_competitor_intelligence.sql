-- =====================================================
-- WyzeLens Competitor Intelligence Table
-- Stores enriched data from FireCrawl scraping
-- =====================================================

CREATE TABLE IF NOT EXISTS competitor_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk user ID for direct user-level cascade
  
  -- Homepage Data
  homepage_title text,
  homepage_description text,
  homepage_screenshot_url text,
  homepage_links_count int DEFAULT 0,
  
  -- Structured Data from Homepage
  company_description text,
  main_products jsonb DEFAULT '[]'::jsonb, -- array of strings
  key_value_propositions jsonb DEFAULT '[]'::jsonb, -- array of strings
  headquarters text,
  contact_phone text,
  contact_email text,
  
  -- Company Information (About Page)
  company_history text,
  employee_count text,
  number_of_locations text,
  mission_statement text,
  
  -- Social Media Links
  social_linkedin text,
  social_twitter text,
  social_facebook text,
  social_instagram text,
  social_youtube text,
  
  -- Careers/Jobs (Growth Signal)
  careers_page_url text,
  open_positions_count int DEFAULT 0,
  open_positions jsonb DEFAULT '[]'::jsonb, -- array of {title, department, location}
  
  -- News/Blog
  news_page_url text,
  has_blog boolean DEFAULT false,
  latest_posts jsonb DEFAULT '[]'::jsonb, -- array of {title, date, url}
  
  -- Pricing (if available)
  pricing_page_url text,
  pricing_plans jsonb DEFAULT '[]'::jsonb, -- array of {name, price, currency, features}
  
  -- Strategic Intelligence (AI-generated)
  strategic_direction text,
  competitive_threats text[],
  market_positioning text,
  
  -- Metadata
  enrichment_version text DEFAULT 'v1.0',
  last_enriched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(competitor_id) -- One intelligence record per competitor
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_competitor_intelligence_competitor_id 
  ON competitor_intelligence(competitor_id);

CREATE INDEX IF NOT EXISTS idx_competitor_intelligence_user_id 
  ON competitor_intelligence(user_id);

CREATE INDEX IF NOT EXISTS idx_competitor_intelligence_last_enriched 
  ON competitor_intelligence(last_enriched_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE competitor_intelligence ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own competitor intelligence
CREATE POLICY "Users can view their competitor intelligence"
  ON competitor_intelligence
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own competitor intelligence
CREATE POLICY "Users can insert their competitor intelligence"
  ON competitor_intelligence
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own competitor intelligence
CREATE POLICY "Users can update their competitor intelligence"
  ON competitor_intelligence
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own competitor intelligence
CREATE POLICY "Users can delete their competitor intelligence"
  ON competitor_intelligence
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- =====================================================
-- Trigger: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_competitor_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competitor_intelligence_timestamp
  BEFORE UPDATE ON competitor_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_intelligence_updated_at();

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE competitor_intelligence IS 'Stores enriched competitor data from FireCrawl web scraping';
COMMENT ON COLUMN competitor_intelligence.enrichment_version IS 'Version of enrichment logic used (for backward compatibility)';
COMMENT ON COLUMN competitor_intelligence.main_products IS 'JSON array of product/service names';
COMMENT ON COLUMN competitor_intelligence.open_positions IS 'JSON array of job postings: [{title, department, location}]';
COMMENT ON COLUMN competitor_intelligence.latest_posts IS 'JSON array of blog posts: [{title, date, url}]';
COMMENT ON COLUMN competitor_intelligence.pricing_plans IS 'JSON array of pricing tiers: [{name, price, currency, features}]';
