/**
 * Competitor Intelligence Types
 * Matches competitor_intelligence table schema
 */

export interface CompetitorIntelligence {
  id: string
  competitor_id: string
  user_id: string
  
  // Homepage Data
  homepage_title: string | null
  homepage_description: string | null
  homepage_screenshot_url: string | null
  homepage_links_count: number
  
  // Structured Data
  company_description: string | null
  main_products: string[]
  key_value_propositions: string[]
  headquarters: string | null
  contact_phone: string | null
  contact_email: string | null
  
  // Company Information
  company_history: string | null
  employee_count: string | null
  number_of_locations: string | null
  mission_statement: string | null
  
  // Social Media
  social_linkedin: string | null
  social_twitter: string | null
  social_facebook: string | null
  social_instagram: string | null
  social_youtube: string | null
  
  // Careers (Growth Signal)
  careers_page_url: string | null
  open_positions_count: number
  open_positions: JobPosition[]
  
  // News/Blog
  news_page_url: string | null
  has_blog: boolean
  latest_posts: BlogPost[]
  
  // Pricing
  pricing_page_url: string | null
  pricing_plans: PricingPlan[]
  
  // Strategic Intelligence
  strategic_direction: string | null
  competitive_threats: string[]
  market_positioning: string | null
  
  // Metadata
  enrichment_version: string
  last_enriched_at: string
  created_at: string
  updated_at: string
}

export interface JobPosition {
  title: string
  department?: string
  location?: string
}

export interface BlogPost {
  title: string
  date?: string
  url: string
}

export interface PricingPlan {
  name: string
  price: number
  currency: string
  features: string[]
}
