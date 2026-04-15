/**
 * WyzeLens Competitor Enrichment Function
 * Uses FireCrawl to scrape and enrich competitor data
 * Stores results in competitor_intelligence table
 */

import type { Handler } from "@netlify/functions"
import Firecrawl from '@mendable/firecrawl-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

// ========== UTILITY FUNCTIONS ==========

async function supabaseGet(table: string, filter: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })
  if (!res.ok) throw new Error(`Supabase GET ${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabaseUpsert(table: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Supabase UPSERT ${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

// ========== FIRECRAWL ENRICHMENT ==========

async function enrichCompetitor(competitorId: string, domain: string, userId: string) {
  console.log(`[ENRICH] Starting enrichment for competitor ${competitorId} (${domain})`)
  
  const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY! })
  const results: any = {
    competitor_id: competitorId,
    user_id: userId,
    enrichment_version: 'v1.0',
    last_enriched_at: new Date().toISOString()
  }
  
  try {
    // 1. Scrape Homepage
    console.log(`[ENRICH] Step 1: Homepage - https://${domain}`)
    const homepage = await firecrawl.scrape(`https://${domain}`, {
      formats: ['markdown', {
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            company_description: { type: 'string' },
            main_products: { 
              type: 'array',
              items: { type: 'string' }
            },
            key_value_propositions: {
              type: 'array',
              items: { type: 'string' }
            },
            headquarters: { type: 'string' },
            contact_info: {
              type: 'object',
              properties: {
                phone: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        }
      }, 'links', 'screenshot']
    })
    
    // Store homepage data
    results.homepage_title = homepage.metadata?.title || null
    results.homepage_description = homepage.metadata?.description || null
    results.homepage_screenshot_url = homepage.screenshot || null
    results.homepage_links_count = homepage.links?.length || 0
    
    // Store structured data
    if (homepage.json) {
      results.company_description = homepage.json.company_description || null
      results.main_products = homepage.json.main_products || []
      results.key_value_propositions = homepage.json.key_value_propositions || []
      results.headquarters = homepage.json.headquarters || null
      results.contact_phone = homepage.json.contact_info?.phone || null
      results.contact_email = homepage.json.contact_info?.email || null
    }
    
    // Extract social media links
    const socialLinks = homepage.links?.filter((link: string) => 
      link.includes('linkedin.com') || 
      link.includes('twitter.com') || 
      link.includes('facebook.com') ||
      link.includes('instagram.com') ||
      link.includes('youtube.com')
    ) || []
    
    results.social_linkedin = socialLinks.find((l: string) => l.includes('linkedin.com')) || null
    results.social_twitter = socialLinks.find((l: string) => l.includes('twitter.com')) || null
    results.social_facebook = socialLinks.find((l: string) => l.includes('facebook.com')) || null
    results.social_instagram = socialLinks.find((l: string) => l.includes('instagram.com')) || null
    results.social_youtube = socialLinks.find((l: string) => l.includes('youtube.com')) || null
    
    console.log(`[ENRICH] Homepage scraped: ${homepage.links?.length || 0} links, ${socialLinks.length} social links`)
    
    // 2. Scrape About Page (if found)
    const aboutUrls = homepage.links?.filter((link: string) => 
      link.includes('/about') || 
      link.includes('/company') ||
      link.includes('/who-we-are')
    ) || []
    
    if (aboutUrls.length > 0) {
      console.log(`[ENRICH] Step 2: About page - ${aboutUrls[0]}`)
      try {
        const aboutPage = await firecrawl.scrape(aboutUrls[0], {
          formats: [{
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                company_history: { type: 'string' },
                employee_count: { type: 'string' },
                number_of_locations: { type: 'string' },
                mission_statement: { type: 'string' }
              }
            }
          }]
        })
        
        if (aboutPage.json) {
          results.company_history = aboutPage.json.company_history || null
          results.employee_count = aboutPage.json.employee_count || null
          results.number_of_locations = aboutPage.json.number_of_locations || null
          results.mission_statement = aboutPage.json.mission_statement || null
        }
        console.log(`[ENRICH] About page scraped`)
      } catch (err) {
        console.log(`[ENRICH] About page scraping failed (non-critical):`, err.message)
      }
    } else {
      console.log(`[ENRICH] No about page found`)
    }
    
    // 3. Scrape Careers Page (Growth Signal)
    const careerUrls = homepage.links?.filter((link: string) => 
      link.includes('/career') || 
      link.includes('/jobs') ||
      link.includes('/join')
    ) || []
    
    if (careerUrls.length > 0) {
      console.log(`[ENRICH] Step 3: Careers page - ${careerUrls[0]}`)
      try {
        const careersPage = await firecrawl.scrape(careerUrls[0], {
          formats: [{
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                open_positions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      department: { type: 'string' },
                      location: { type: 'string' }
                    }
                  }
                }
              }
            }
          }]
        })
        
        results.careers_page_url = careerUrls[0]
        results.open_positions = careersPage.json?.open_positions || []
        results.open_positions_count = results.open_positions.length
        console.log(`[ENRICH] Careers page scraped: ${results.open_positions_count} positions`)
      } catch (err) {
        console.log(`[ENRICH] Careers page scraping failed (non-critical):`, err.message)
        results.careers_page_url = careerUrls[0]
      }
    } else {
      console.log(`[ENRICH] No careers page found`)
    }
    
    // 4. Detect News/Blog
    const newsUrls = homepage.links?.filter((link: string) => 
      link.includes('/news') || 
      link.includes('/blog') ||
      link.includes('/press')
    ) || []
    
    if (newsUrls.length > 0) {
      results.news_page_url = newsUrls[0]
      results.has_blog = true
      console.log(`[ENRICH] News/Blog detected: ${newsUrls[0]}`)
    } else {
      results.has_blog = false
      console.log(`[ENRICH] No news/blog page found`)
    }
    
    // 5. Store in Supabase (UPSERT based on competitor_id)
    console.log(`[ENRICH] Storing results in Supabase...`)
    await supabaseUpsert('competitor_intelligence', results)
    
    console.log(`[ENRICH] ✅ Enrichment completed for ${domain}`)
    return results
    
  } catch (error) {
    console.error(`[ENRICH] ❌ Enrichment failed for ${domain}:`, error)
    throw error
  }
}

// ========== HANDLER ==========

export const handler: Handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' }
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }
  
  try {
    const { competitorId, userId } = JSON.parse(event.body || '{}')
    
    if (!competitorId || !userId) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'Missing competitorId or userId' })
      }
    }
    
    console.log(`[ENRICH-COMPETITOR] Request: competitorId=${competitorId}, userId=${userId}`)
    
    // 1. Get competitor from database
    const competitors = await supabaseGet('competitors', `id=eq.${competitorId}`)
    if (!competitors || competitors.length === 0) {
      return {
        statusCode: 404,
        headers: CORS,
        body: JSON.stringify({ error: 'Competitor not found' })
      }
    }
    
    const competitor = competitors[0]
    const domain = competitor.domain
    
    if (!domain) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'Competitor has no domain' })
      }
    }
    
    // 2. Enrich competitor
    const results = await enrichCompetitor(competitorId, domain, userId)
    
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        data: results,
        message: `Competitor ${competitor.name} enriched successfully`
      })
    }
    
  } catch (error) {
    console.error('[ENRICH-COMPETITOR] Error:', error)
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}
