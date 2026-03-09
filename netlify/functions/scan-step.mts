/**
 * WyzeLens Multi-Step Scan Function
 * Each step runs independently within Netlify's timeout
 * Frontend orchestrates: step1 → step2 → step3 → step4
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY
const POE_KEY = process.env.POE_API_KEY
const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo_user'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

/**
 * Validate and fix malformed timestamps from external APIs
 * Returns valid ISO timestamp or null
 */
function validateTimestamp(ts: string | null | undefined): string | null {
  if (!ts) return null
  
  try {
    // Check if date is valid
    const date = new Date(ts)
    if (isNaN(date.getTime())) {
      console.warn(`[VALIDATION] Invalid timestamp: "${ts}", using current time`)
      return new Date().toISOString()
    }
    
    // Additional check: ensure date string has proper format (YYYY-MM-DD at minimum)
    if (!/^\d{4}-\d{2}-\d{2}/.test(ts)) {
      console.warn(`[VALIDATION] Malformed timestamp: "${ts}", using current time`)
      return new Date().toISOString()
    }
    
    return date.toISOString() // Normalize to ISO format
  } catch (e) {
    console.warn(`[VALIDATION] Timestamp parse error: "${ts}", using current time`)
    return new Date().toISOString()
  }
}

function parseJsonArray(text: string) {
  try {
    // Remove markdown code fences if present
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    // Extract JSON array
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (match) {
      // Remove trailing commas before closing brackets
      const fixed = match[0].replace(/,(\s*[}\]])/g, '$1')
      return JSON.parse(fixed)
    }
    
    // Try parsing directly
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON parse error:', e, 'Raw text:', text.slice(0, 200))
    return []
  }
}

async function supabasePost(table: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabasePatch(table: string, filter: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Supabase PATCH ${table}: ${res.status} ${await res.text()}`)
}

async function poeRequest(prompt: string) {
  const res = await fetch('https://api.poe.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${POE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Claude-Sonnet-4.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    })
  })
  const data = await res.json()
  console.log('Poe response status:', res.status, 'has choices:', !!data?.choices)
  if (!data?.choices?.[0]?.message?.content) {
    console.error('Poe API error:', JSON.stringify(data).slice(0, 500))
    throw new Error(`Poe API error: ${data?.error?.message || data?.detail || res.status}`)
  }
  return data.choices[0].message.content
}

// ========== STEPS ==========

// Step -1: Detect industry from company URL
async function stepDetect(companyUrl: string) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'Business analyst. Respond with valid JSON only. No markdown, no code fences.' },
        { role: 'user', content: `Analyze this company website: ${companyUrl}
Identify the company name and its specific industry/sector.
Be SPECIFIC about the industry — not generic categories. For example:
- "Pulp & Paper" not "Manufacturing"
- "Cloud Computing" not "Technology"  
- "Electric Vehicles" not "Automotive"
- "Digital Payments" not "Fintech"
Use the most precise industry label that describes what this company actually does.
JSON: {"company_name": "X", "industry": "Y", "description": "1-2 sentence description of what the company does"}` }
      ],
      temperature: 0.2, max_tokens: 500
    })
  })
  const data = await res.json()
  console.log('Detect raw response:', JSON.stringify(data).slice(0, 500))
  
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    console.error('No content in detect response:', JSON.stringify(data).slice(0, 300))
    throw new Error('Failed to detect industry from URL. API returned no content.')
  }
  
  try {
    // Remove markdown code fences if present
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return { 
        company_name: parsed.company_name || 'Unknown',
        industry: parsed.industry || 'Technology',
        description: parsed.description || ''
      }
    }
  } catch (e) {
    console.error('Detect parse error:', e, 'content:', content.slice(0, 300))
  }
  return { company_name: 'Unknown', industry: 'Technology', description: '' }
}

// Step 0: Create scan record OR reuse existing profile (incremental model)
async function stepInit(industry: string, companyUrl?: string, companyName?: string, userId?: string, isScheduled?: boolean, isRefresh?: boolean) {
  // Require authentication - no fallback to demo_user
  if (!userId) {
    console.error('[stepInit] No userId provided - authentication required')
    throw new Error('Authentication required. Please log in and try again.')
  }
  
  // Use Clerk ID directly (TEXT, no conversion needed)
  const actualUserId = userId
  
  // Check for existing profile with same industry (completed OR running) and optionally same company_url
  // Include 'running' to reuse scans that didn't complete (e.g., timeout, error, etc.)
  let queryUrl = `${SUPABASE_URL}/rest/v1/scans?user_id=eq.${actualUserId}&industry=eq.${encodeURIComponent(industry)}&status=in.(completed,running)&order=created_at.desc&limit=1`
  
  // If company_url is provided, filter by it as well
  if (companyUrl) {
    queryUrl += `&company_url=eq.${encodeURIComponent(companyUrl)}`
  } else {
    // If no company_url, match scans with NULL company_url (industry-only profiles)
    queryUrl += `&company_url=is.null`
  }
  
  const res = await fetch(queryUrl, {
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  })
  const existingProfiles = await res.json()
  
  console.log(`[stepInit] Looking for existing ${industry} profile (companyUrl: ${companyUrl || 'null'})`)
  console.log(`[stepInit] Found ${existingProfiles.length} existing profiles`)
  
  // isRefresh explicitly passed → honor it
  // isRefresh not passed (undefined) → default to REFRESH for existing profiles (backward compat)
  const actualIsRefresh = isRefresh === undefined ? true : isRefresh
  console.log(`[stepInit] Mode: ${actualIsRefresh ? 'REFRESH' : 'RESCAN'} (isRefresh param: ${isRefresh}, resolved: ${actualIsRefresh})`)
  
  if (existingProfiles && existingProfiles.length > 0) {
    const existingScan = existingProfiles[0]
    
    if (actualIsRefresh) {
      // ═══════════════════════════════════════════════════════════════
      // REFRESH MODE: Reuse scan, update news/insights only
      // ═══════════════════════════════════════════════════════════════
      console.log(`[stepInit] REFRESH MODE - Reusing scan ${existingScan.id} (refresh count: ${existingScan.refresh_count || 0})`)
      
      // ✅ CHECK REFRESH LIMITS (only for manual refreshes, not scheduled)
      if (!isScheduled) {
        console.log('[stepInit] Checking manual refresh daily limits...')
      
        // Get user subscription
        const subRes = await fetch(
          `${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${actualUserId}&order=created_at.desc&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
          }
        )
        
        const subs = await subRes.json()
        const plan = subs?.[0]?.plan || 'free'
        console.log(`[stepInit] User plan: ${plan}`)
        
        const now = new Date()
        
        // Manual refresh daily limits: FREE=1/day, STARTER=3/day, PRO+=unlimited
        const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
        
        // Count manual refreshes today (UTC) - check BEFORE creating new log
        const countRes = await fetch(
          `${SUPABASE_URL}/rest/v1/refresh_logs?user_id=eq.${actualUserId}&triggered_by=eq.manual&started_at=gte.${startOfDayUTC.toISOString()}&select=id`,
          {
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
          }
        )
        const todaysRefreshes = await countRes.json()
        const manualRefreshCount = todaysRefreshes?.length || 0
        
        const dailyRefreshLimits: Record<string, number> = {
          free: 1,
          starter: 3,
          pro: 999,        // unlimited
          business: 999,   // unlimited
          enterprise: 999  // unlimited
        }
        
        const dailyLimit = dailyRefreshLimits[plan] || dailyRefreshLimits.free
        
        if (manualRefreshCount >= dailyLimit) {
          console.error(`[stepInit] Daily manual refresh limit reached: ${manualRefreshCount}/${dailyLimit}`)
          throw new Error(`Daily refresh limit reached. Your ${plan} plan allows ${dailyLimit} manual refresh${dailyLimit > 1 ? 'es' : ''} per day. Upgrade for more frequent updates or wait until tomorrow (UTC).`)
        }
        
        console.log(`[stepInit] Manual refresh allowed: ${manualRefreshCount}/${dailyLimit} used today`)
        
      } else {
        console.log('[stepInit] Scheduled refresh - skipping manual refresh limits')
      }
      // ✅ END REFRESH LIMITS CHECK
      
      // ═══════════════════════════════════════════════════════════════
      // 🧹 RESET is_new FLAGS (prevent old items from showing NEW badge)
      // ═══════════════════════════════════════════════════════════════
      console.log(`[stepInit] Resetting is_new flags for scan ${existingScan.id}`)
      
      await supabasePatch('news_feed', `scan_id=eq.${existingScan.id}`, { is_new: false })
      await supabasePatch('insights', `scan_id=eq.${existingScan.id}`, { is_new: false })
      await supabasePatch('alerts', `scan_id=eq.${existingScan.id}`, { is_new: false })
      
      console.log(`[stepInit] Flags reset complete`)
      
      // Update scan metadata
      await supabasePatch('scans', `id=eq.${existingScan.id}`, {
        status: 'running',
        last_refreshed_at: new Date().toISOString(),
        refresh_count: (existingScan.refresh_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      
      return { 
        scanId: existingScan.id, 
        isRefresh: true,
        userId: actualUserId
      }
      
    } else {
      // ═══════════════════════════════════════════════════════════════
      // RESCAN MODE: Same industry, but user wants fresh competitors
      // Delete old scan and create new one (will check profile limits below)
      // ═══════════════════════════════════════════════════════════════
      console.log(`[stepInit] RESCAN MODE - Deleting old scan ${existingScan.id} and creating fresh scan`)
      
      // Delete old scan (cascade will remove competitors, news, insights, alerts)
      await fetch(`${SUPABASE_URL}/rest/v1/scans?id=eq.${existingScan.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      })
      
      console.log(`[stepInit] Old scan deleted, proceeding to create new scan`)
      // Fall through to NEW SCAN logic below
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NEW SCAN MODE: Check profile COUNT limits
  // ═══════════════════════════════════════════════════════════════
  console.log(`[stepInit] NEW SCAN MODE - Creating scan for ${industry}`)
  console.log('[stepInit] Checking profile COUNT limits...')
  
  // Get user subscription
  const subRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${actualUserId}&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  
  const subs = await subRes.json()
  const plan = subs?.[0]?.plan || 'free'
  console.log(`[stepInit] User plan: ${plan}`)
  
  // Count active scans (exclude failed)
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/scans?user_id=eq.${actualUserId}&status=neq.failed&select=id`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  
  const scans = await countRes.json()
  const activeScans = scans?.length || 0
  console.log(`[stepInit] Active scans: ${activeScans}`)
  
  // Plan limits for NEW profiles (updated 2026-03-06)
  const limits: Record<string, number> = {
    free: 1,
    starter: 3,      // ← Was 1
    pro: 5,          // ← Was 3
    business: 10,
    enterprise: 999
  }
  
  const limit = limits[plan] || 1
  
  if (activeScans >= limit) {
    console.error(`[stepInit] Plan limit reached: ${activeScans}/${limit}`)
    throw new Error(`Plan limit reached. You have ${activeScans} active profile${activeScans > 1 ? 's' : ''}. Your ${plan} plan allows ${limit}. Please upgrade to create more.`)
  }
  
  console.log(`[stepInit] Limit check passed: ${activeScans}/${limit}`)
  
  // ═══════════════════════════════════════════════════════════════
  // 🔒 CHECK INDUSTRY COOLDOWN (prevent delete/recreate bypass)
  // ═══════════════════════════════════════════════════════════════
  console.log('[stepInit] Checking industry cooldown...')
  
  // Cooldown rules by plan (hours)
  const cooldownHours: Record<string, number> = {
    free: 24,        // Free: 24h cooldown between same industry scans
    starter: 12,     // Starter: 12h cooldown
    pro: 0,          // Pro: no cooldown (can recreate instantly)
    business: 0,
    enterprise: 0
  }
  
  const requiredCooldown = cooldownHours[plan] || cooldownHours.free
  
  if (requiredCooldown > 0) {
    // Check if user created this industry recently
    const cooldownRes = await fetch(
      `${SUPABASE_URL}/rest/v1/industry_cooldowns?user_id=eq.${actualUserId}&industry=eq.${encodeURIComponent(industry)}&select=last_scan_created_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const cooldowns = await cooldownRes.json()
    
    if (cooldowns && cooldowns.length > 0) {
      const lastCreated = new Date(cooldowns[0].last_scan_created_at)
      const hoursSince = (Date.now() - lastCreated.getTime()) / (1000 * 60 * 60)
      
      if (hoursSince < requiredCooldown) {
        const hoursRemaining = Math.ceil(requiredCooldown - hoursSince)
        console.error(`[stepInit] Industry cooldown active: ${hoursSince.toFixed(1)}h since last ${industry} scan, need ${requiredCooldown}h`)
        throw new Error(`You recently deleted and recreated the "${industry}" profile. Your ${plan} plan requires a ${requiredCooldown}-hour cooldown between creating new scans for the same industry. Please wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} or upgrade for instant access.`)
      }
      
      console.log(`[stepInit] Cooldown check passed (${hoursSince.toFixed(1)}h since last scan)`)
    } else {
      console.log('[stepInit] No previous cooldown found (first scan for this industry)')
    }
  } else {
    console.log('[stepInit] No cooldown required (Pro+ plan)')
  }
  
  // ✅ COOLDOWN CHECK PASSED
  
  // Create new profile
  const [scan] = await supabasePost('scans', {
    user_id: actualUserId,
    industry,
    status: 'running',
    company_url: companyUrl || null,
    company_name: companyName || null,
    refresh_count: 0
  })
  
  // Update cooldown timestamp (upsert)
  console.log('[stepInit] Updating industry cooldown timestamp...')
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/industry_cooldowns`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'  // Upsert on conflict
      },
      body: JSON.stringify({
        user_id: actualUserId,
        industry,
        last_scan_created_at: new Date().toISOString()
      })
    })
    console.log('[stepInit] Cooldown timestamp updated')
  } catch (e) {
    console.warn('[stepInit] Failed to update cooldown (non-critical):', e)
    // Non-critical error, continue
  }
  
  return { scanId: scan.id, isRefresh: false, userId: actualUserId }
}

// Step 1: Find competitors via Perplexity
async function stepCompetitors(industry: string, scanId: string, companyUrl?: string, maxCompetitors?: number, regions?: string[], watchlist?: string[], userId?: string) {
  const max = maxCompetitors || 15
  const regionStr = regions && regions.length > 0 && !regions.includes('Global') ? ` Focus on companies operating in: ${regions.join(', ')}.` : ''
  const watchlistStr = watchlist && watchlist.length > 0 ? `\n\nIMPORTANT: You MUST include these companies in the results: ${watchlist.join(', ')}.` : ''
  let prompt: string
  
  if (companyUrl) {
    prompt = `I run a company with this website: ${companyUrl}
We operate in the ${industry} industry.

Find EXACTLY ${max} direct competitors (companies offering similar products/services to similar customers).${regionStr}
You MUST return ${max} competitors. If direct competitors are limited, include indirect competitors, adjacent players, or emerging alternatives to reach the required count.${watchlistStr}

For each competitor provide:
- name
- domain (website)  
- description (1-2 sentences explaining what they do and why they're a competitor)
- position (e.g. "Direct Competitor", "Market Leader", "Emerging Threat", "Niche Player", "Adjacent Player")

JSON array: [{name, domain, description, position}]

CRITICAL: You must return ${max} results. Do not return fewer than requested.`
  } else {
    prompt = `List EXACTLY ${max} companies in the ${industry} industry as of 2025-2026.${regionStr}
Include market leaders, established players, and notable emerging companies to reach exactly ${max} results.
Use current data only.${watchlistStr}

For each company provide:
- name
- domain (website)
- description (1-2 sentences)
- position (e.g. "Market Leader", "Emerging Player", "Established Competitor")

JSON array: [{name, domain, description, position}]

CRITICAL: You must return ${max} results. Do not return fewer than requested.`
  }

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: `Business intelligence analyst specializing in competitive analysis. You MUST always return EXACTLY the requested number of competitors (${max}). Respond with valid JSON only. Include direct competitors first, then indirect/adjacent players to meet the count requirement. Never return fewer results than requested.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4, max_tokens: 2500
    })
  })
  const data = await res.json()
  const companies = parseJsonArray(data.choices[0].message.content)
    .filter((c: any) => c.name)
  
  // Log if we didn't get the requested count
  if (companies.length < max) {
    console.warn(`[COMPETITORS] Only received ${companies.length}/${max} competitors. Prompt may need adjustment.`)
  }
  
  return { companies, count: companies.length }
}

// Step 2: Collect news via Perplexity
async function stepNews(industry: string) {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'News analyst. Respond with valid JSON only. Extract the ACTUAL publication date from each article (including if published today). If exact time unknown, use 12:00:00Z.' },
        { role: 'user', content: `Find 20 most recent ${industry} news articles published between ${sevenDaysAgo} and ${today}.

CRITICAL: For EACH article, extract its ACTUAL publication date from the source (look for "Published on", byline dates, article metadata). If the article was truly published today (${today}), use today's date. Otherwise use the actual date shown on the article.

PRIORITIZE:
1. Articles published TODAY (${today}) - most important
2. Articles from the last 3 days
3. Articles from the last 7 days

Each article MUST include:
- Unique URL (no duplicates)
- ACTUAL publication date in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- If exact time unknown, use 12:00:00Z

JSON array: [{
  "title": "Article title",
  "summary": "2-3 sentence summary",
  "source": "Publication name",
  "url": "https://...",
  "tags": ["tag1", "tag2"],
  "published_at": "YYYY-MM-DDTHH:MM:SSZ"
}]

Example: "published_at": "2026-02-27T14:30:00Z" (if published yesterday at 2:30 PM)` }
      ],
      temperature: 0.3, max_tokens: 4000
    })
  })
  const data = await res.json()
  
  console.log('[NEWS] Raw Perplexity response sample:', JSON.stringify(data?.choices?.[0]?.message?.content || '').slice(0, 500))
  
  const news = parseJsonArray(data.choices[0].message.content)
    .filter((n: any) => {
      // Must have title, URL, and published_at
      if (!n.title || !n.url || !n.published_at) {
        console.log('[NEWS] Skipping incomplete article:', n.title || 'no title')
        return false
      }
      // Validate published_at is a real date (not today unless actually published today)
      const pubDate = new Date(n.published_at)
      const now = new Date()
      if (isNaN(pubDate.getTime())) {
        console.log('[NEWS] Invalid date for:', n.title)
        return false
      }
      return true
    })
    .slice(0, 20)
  
  console.log(`[NEWS] Collected ${news.length} articles with valid publication dates`)
  
  return { news, count: news.length }
}

// Step 1.5: Copy competitors from previous scan
async function stepCopyCompetitors(previousScanId: string, newScanId: string) {
  // Fetch competitors from previous scan
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${previousScanId}`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  const previousCompetitors = await res.json()
  
  if (previousCompetitors && previousCompetitors.length > 0) {
    // Copy competitors with new scan_id
    const copiedCompetitors = await supabasePost('competitors',
      previousCompetitors.map((c: any) => ({
        user_id: c.user_id,
        scan_id: newScanId,
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        threat_score: c.threat_score,
        activity_level: c.activity_level,
        description: c.description,
        employee_count: c.employee_count,
        stock_ticker: c.stock_ticker,
        stock_price: c.stock_price,
        stock_currency: c.stock_currency,
        stock_change_percent: c.stock_change_percent,
        sentiment_score: c.sentiment_score,
        last_activity_date: c.last_activity_date
      }))
    )
    return { count: copiedCompetitors.length }
  }
  return { count: 0 }
}

// ========== NEW SPLIT STEPS (replace stepAnalyzeAndWrite) ==========

// Step 3a: Analyze competitors (Poe API ~8s)
async function stepAnalyzeCompetitors(
  industry: string,
  scanId: string,
  companies: any[],
  userId?: string
) {
  if (!userId) {
    throw new Error('Authentication required')
  }
  const actualUserId = userId
  
  console.log(`[ANALYZE-COMPETITORS] Starting for ${companies.length} companies`)
  
  const prompt = `Analyze ${industry} companies. Each: threat_score(0-10), activity_level(low/medium/high), description, employee_count, stock_ticker (if publicly traded, use format like "AAPL", "MSFT", "TSE:RY" for Toronto, "EPA:BNP" for Paris etc. Use null if private).
Companies: ${companies.map((c: any) => c.name).join(', ')}
JSON array only: [{"name":"X","threat_score":7.5,"activity_level":"high","description":"Desc","employee_count":500,"industry":"${industry}","stock_ticker":"AAPL"}]`

  const response = await poeRequest(prompt)
  const analyzed = parseJsonArray(response)
  
  console.log(`[ANALYZE-COMPETITORS] Analyzed ${analyzed.length} competitors`)
  
  return {
    competitors: analyzed.map((c: any) => ({
      ...c,
      domain: companies.find((co: any) => co.name === c.name)?.domain || null
    })),
    count: analyzed.length
  }
}

// Step 3b: Generate insights (Poe API ~8s)
async function stepAnalyzeInsights(
  industry: string,
  scanId: string,
  news: any[],
  competitorNames: string[],
  userId?: string
) {
  if (!userId) {
    throw new Error('Authentication required')
  }
  const actualUserId = userId
  
  console.log(`[ANALYZE-INSIGHTS] Starting for ${industry}`)
  
  const prompt = `3-4 strategic insights for ${industry}.
Companies: ${competitorNames.slice(0,5).join(', ')}
News: ${news.slice(0,8).map((n: any) => n.title).join('; ')}
JSON: [{"type":"threat|opportunity|trend|recommendation","title":"X","description":"2-3 sentences","confidence":0.85,"impact":"high","action_items":["X"]}]`

  const response = await poeRequest(prompt)
  const insights = parseJsonArray(response)
  
  console.log(`[ANALYZE-INSIGHTS] Generated ${insights.length} insights`)
  
  return {
    insights,
    count: insights.length
  }
}

// Step 3c: Generate alerts (Poe API ~8s)
async function stepAnalyzeAlerts(
  industry: string,
  scanId: string,
  news: any[],
  competitorNames: string[],
  userId?: string
) {
  if (!userId) {
    throw new Error('Authentication required')
  }
  const actualUserId = userId
  
  console.log(`[ANALYZE-ALERTS] Starting for ${industry}`)
  
  const prompt = `5-7 alerts from ${industry} news.
Companies: ${competitorNames.slice(0,8).join(', ')}
News: ${news.slice(0,12).map((n: any) => n.title).join('; ')}
JSON: [{"title":"X","description":"Context","priority":"critical|attention|info","category":"funding|product|hiring|news|market"}]`

  const response = await poeRequest(prompt)
  const alerts = parseJsonArray(response)
  
  console.log(`[ANALYZE-ALERTS] Generated ${alerts.length} alerts`)
  
  return {
    alerts,
    count: alerts.length
  }
}

// Step 3d: Finalize - Write all data + generate analytics (~8s)
async function stepFinalize(
  industry: string,
  scanId: string,
  competitors: any[],
  insights: any[],
  alerts: any[],
  news: any[],
  isRefresh: boolean,
  userId?: string
) {
  if (!userId) {
    throw new Error('Authentication required')
  }
  const actualUserId = userId
  
  console.log(`[FINALIZE] Starting for scan ${scanId}`)
  console.log(`[FINALIZE] Data: ${competitors.length} competitors, ${insights.length} insights, ${alerts.length} alerts, ${news.length} news`)
  
  // Write competitors to DB (only if new scan)
  const insertedCompetitors = !isRefresh && competitors.length > 0 ? await supabasePost('competitors',
    competitors.map((c: any) => ({
      user_id: actualUserId,
      scan_id: scanId,
      name: c.name,
      domain: c.domain || null,
      industry: c.industry || industry,
      threat_score: c.threat_score || 5.0,
      activity_level: c.activity_level || 'medium',
      description: c.description || '',
      employee_count: c.employee_count || null,
      stock_ticker: c.stock_ticker || null,
      stock_price: null,
      stock_currency: null,
      stock_change_percent: null,
      sentiment_score: Math.random() * 0.5 + 0.3,
      last_activity_date: new Date().toISOString()
    }))
  ) : []
  
  console.log(`[FINALIZE] Inserted ${insertedCompetitors.length} competitors`)
  
  // ✅ RESET is_new FLAGS FOR EXISTING ITEMS (before inserting new ones)
  if (isRefresh) {
    console.log('[FINALIZE] Resetting is_new flags for existing items in this scan...')
    
    await fetch(`${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    await fetch(`${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    await fetch(`${SUPABASE_URL}/rest/v1/news_feed?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    console.log('[FINALIZE] All existing items marked as is_new=false')
  }
  
  // Write alerts - with duplicate title checking (per scan)
  let insertedAlerts: any[] = []
  
  if (alerts.length > 0) {
    // Fetch existing alert titles for this scan
    const existingAlertsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}&select=title`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const existingAlerts = await existingAlertsRes.json()
    const existingTitles = new Set(
      existingAlerts.map((a: any) => a.title).filter((title: string) => title)
    )
    
    console.log(`[FINALIZE] Found ${existingTitles.size} existing alert titles for this scan`)
    
    // Filter out duplicates
    const newAlerts = alerts.filter((a: any) => !existingTitles.has(a.title))
    
    console.log(`[FINALIZE] Filtered to ${newAlerts.length} new alerts (${alerts.length - newAlerts.length} duplicates skipped)`)
    
    if (newAlerts.length > 0) {
      insertedAlerts = await supabasePost('alerts',
        newAlerts.map((a: any) => ({
          user_id: actualUserId,
          scan_id: scanId,
          competitor_id: insertedCompetitors[0]?.id || null,
          title: a.title,
          description: a.description,
          priority: a.priority || 'info',
          category: a.category || 'news',
          read: false,
          is_new: true,
          added_at: new Date().toISOString()
        }))
      )
    }
  }
  
  console.log(`[FINALIZE] Inserted ${insertedAlerts.length} alerts`)
  
  // Write insights - with duplicate title checking (per scan)
  let insertedInsights: any[] = []
  
  if (insights.length > 0) {
    // Fetch existing insight titles for this scan
    const existingInsightsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}&select=title`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const existingInsights = await existingInsightsRes.json()
    const existingTitles = new Set(
      existingInsights.map((i: any) => i.title).filter((title: string) => title)
    )
    
    console.log(`[FINALIZE] Found ${existingTitles.size} existing insight titles for this scan`)
    
    // Filter out duplicates
    const newInsights = insights.filter((i: any) => !existingTitles.has(i.title))
    
    console.log(`[FINALIZE] Filtered to ${newInsights.length} new insights (${insights.length - newInsights.length} duplicates skipped)`)
    
    if (newInsights.length > 0) {
      insertedInsights = await supabasePost('insights',
        newInsights.map((i: any) => ({
          user_id: actualUserId,
          scan_id: scanId,
          type: i.type || 'recommendation',
          title: i.title,
          description: i.description,
          confidence: i.confidence || 0.7,
          impact: i.impact || 'medium',
          action_items: i.action_items || [],
          is_new: true,
          added_at: new Date().toISOString()
        }))
      )
    }
  }
  
  console.log(`[FINALIZE] Inserted ${insertedInsights.length} insights`)
  
  // Write news - with duplicate URL checking
  let insertedNews: any[] = []
  
  if (news.length > 0) {
    // Fetch existing news URLs for this user (across all scans)
    const existingNewsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news_feed?user_id=eq.${actualUserId}&select=source_url`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const existingNews = await existingNewsRes.json()
    const existingUrls = new Set(
      existingNews.map((n: any) => n.source_url).filter((url: string) => url)
    )
    
    console.log(`[FINALIZE] Found ${existingUrls.size} existing news URLs in database`)
    
    // Filter out duplicates based on URL (only check recent duplicates - last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    // Fetch recent news (last 24h) to detect true duplicates
    const recentNewsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news_feed?user_id=eq.${actualUserId}&created_at=gte.${yesterday}&select=source_url`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const recentNews = await recentNewsRes.json()
    const recentUrls = new Set(
      recentNews.map((n: any) => n.source_url).filter((url: string) => url)
    )
    
    console.log(`[FINALIZE] Found ${recentUrls.size} news URLs from last 24h (true duplicate check)`)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const uniqueNews = news
      .filter((n: any) => {
        // Skip if URL was inserted in the last 24h (true duplicate)
        if (n.url && recentUrls.has(n.url)) {
          console.log(`[FINALIZE] Skipping recent duplicate URL (last 24h): ${n.url}`)
          return false
        }
        return true
      })
      .map((n: any) => {
        const published_date = n.published_at ? new Date(n.published_at) : new Date()
        return {
          ...n,
          published_date,
          isToday: published_date >= today,
          daysAgo: Math.floor((Date.now() - published_date.getTime()) / (24 * 60 * 60 * 1000))
        }
      })
      .sort((a: any, b: any) => {
        // Sort by actual publication date (newest first)
        return b.published_date.getTime() - a.published_date.getTime()
      })
    
    const todayCount = uniqueNews.filter((n: any) => n.isToday).length
    const last3Days = uniqueNews.filter((n: any) => n.daysAgo <= 3).length
    const last7Days = uniqueNews.filter((n: any) => n.daysAgo <= 7).length
    
    console.log(`[FINALIZE] Filtered to ${uniqueNews.length} unique news items:`)
    console.log(`  - Today: ${todayCount}`)
    console.log(`  - Last 3 days: ${last3Days}`)
    console.log(`  - Last 7 days: ${last7Days}`)
    
    if (uniqueNews.length > 0) {
      insertedNews = await supabasePost('news_feed',
        uniqueNews.map((n: any) => ({
          user_id: actualUserId,
          scan_id: scanId,
          title: n.title,
          summary: n.summary || n.description,
          source: n.source || 'Perplexity',
          source_url: n.url || null,
          relevance_score: n.daysAgo === 0 ? 0.9 : (n.daysAgo <= 3 ? 0.7 : 0.5),
          sentiment: 'neutral',
          tags: n.tags || [],
          published_at: validateTimestamp(n.published_at) || new Date().toISOString(), // Validate before insert
          is_new: true,
          added_at: new Date().toISOString()
        }))
      )
      
      console.log(`[FINALIZE] Sample dates from inserted news:`)
      insertedNews.slice(0, 3).forEach((n: any) => {
        console.log(`  - "${n.title?.slice(0, 50)}..." published at ${n.published_at}`)
      })
    }
  }
  
  console.log(`[FINALIZE] Inserted ${insertedNews.length} news articles`)
  
  // Generate industry analytics (only if new scan)
  let industryAnalytics = null
  
  if (!isRefresh) {
    console.log('[FINALIZE] Generating industry analytics...')
    try {
      const competitorNames = competitors.map((c: any) => c.name).slice(0, 8).join(', ')
      
      const analyticsRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'Market research analyst. Respond with valid JSON only. No markdown, no code fences. Use real, sourced data from recent industry reports (2024-2026 only). IMPORTANT: You MUST provide ALL fields with realistic values. Do NOT return incomplete data. If exact data is unavailable, provide reasonable industry estimates based on similar markets.' },
            { role: 'user', content: `Provide detailed market analytics data for the ${industry} industry based on real market research reports and data from 2024-2026 only.

CRITICAL REQUIREMENTS:
- ALL fields must have values (no null, no empty arrays, no 0%)
- market_leaders_share MUST have at least 3 companies with realistic market shares that sum to reasonable total
- regional_distribution MUST have at least 3 regions with percentages that sum to 100%
- If exact data unavailable, provide reasonable estimates based on similar industries
- Include "sources" array with actual report names and URLs

JSON object (ALL fields required):
{
  "market_size_billions": 150,
  "market_size_year": 2025,
  "projected_size_billions": 220,
  "projected_year": 2030,
  "cagr_percent": 8.5,
  "top_segments": [{"name": "Segment A", "share_percent": 35}, {"name": "Segment B", "share_percent": 28}],
  "growth_drivers": ["Driver 1", "Driver 2", "Driver 3"],
  "key_trends": [{"trend": "Trend name", "impact": "high", "description": "1 sentence"}],
  "funding_activity": {"total_billions": 12, "deal_count": 350, "avg_deal_millions": 34, "yoy_change_percent": 15},
  "market_leaders_share": [{"name": "Company A", "share_percent": 18}, {"name": "Company B", "share_percent": 15}, {"name": "Company C", "share_percent": 12}],
  "regional_distribution": [{"region": "North America", "share_percent": 40}, {"region": "Asia Pacific", "share_percent": 35}, {"region": "Europe", "share_percent": 25}],
  "sources": [{"name": "Report or source name", "url": "https://..."}]
}

Known competitors in this industry: ${competitorNames || 'N/A'}
Use actual competitor names in market_leaders_share if they are major players.` }
          ],
          temperature: 0.2,
          max_tokens: 3500
        })
      })
      
      const analyticsData = await analyticsRes.json()
      const analyticsContent = analyticsData?.choices?.[0]?.message?.content
      
      if (analyticsContent) {
        // Remove markdown code fences if present
        const cleaned = analyticsContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0].replace(/,(\s*[}\]])/g, '$1'))
          
          // Validate critical fields - add fallbacks if missing
          industryAnalytics = {
            market_size_billions: parsed.market_size_billions || 100,
            market_size_year: parsed.market_size_year || 2025,
            projected_size_billions: parsed.projected_size_billions || 150,
            projected_year: parsed.projected_year || 2030,
            cagr_percent: parsed.cagr_percent || 7.5,
            top_segments: parsed.top_segments?.length > 0 ? parsed.top_segments : [
              { name: 'Enterprise', share_percent: 45 },
              { name: 'SMB', share_percent: 35 },
              { name: 'Consumer', share_percent: 20 }
            ],
            growth_drivers: parsed.growth_drivers?.length > 0 ? parsed.growth_drivers : [
              'Digital transformation',
              'Market expansion',
              'Innovation'
            ],
            key_trends: parsed.key_trends?.length > 0 ? parsed.key_trends : [
              { trend: 'AI adoption', impact: 'high', description: 'Increasing automation and intelligence' }
            ],
            funding_activity: parsed.funding_activity || {
              total_billions: 10,
              deal_count: 250,
              avg_deal_millions: 40,
              yoy_change_percent: 10
            },
            market_leaders_share: parsed.market_leaders_share?.length > 0 ? parsed.market_leaders_share : [
              { name: competitors[0]?.name || 'Market Leader 1', share_percent: 20 },
              { name: competitors[1]?.name || 'Market Leader 2', share_percent: 15 },
              { name: competitors[2]?.name || 'Market Leader 3', share_percent: 12 }
            ],
            regional_distribution: parsed.regional_distribution?.length > 0 ? parsed.regional_distribution : [
              { region: 'North America', share_percent: 40 },
              { region: 'Asia Pacific', share_percent: 35 },
              { region: 'Europe', share_percent: 25 }
            ],
            sources: parsed.sources?.length > 0 ? parsed.sources : [
              { name: 'Industry analysis', url: '#' }
            ]
          }
          
          console.log('[FINALIZE] Industry analytics generated with full KPIs + fallbacks')
        }
      }
    } catch (e) {
      console.error('[FINALIZE] Analytics generation failed (non-critical):', e)
    }
  }
  
  // Update scan status to completed
  if (isRefresh) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&select=alerts_count,insights_count,news_count,user_id`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const currentScan = await res.json()
    const current = currentScan[0] || { alerts_count: 0, insights_count: 0, news_count: 0 }
    
    await supabasePatch('scans', `id=eq.${scanId}`, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      alerts_count: current.alerts_count + insertedAlerts.length,
      insights_count: current.insights_count + insertedInsights.length,
      news_count: current.news_count + insertedNews.length
    })
    
    // ✅ LOG REFRESH ACTIVITY
    console.log('[FINALIZE] Creating refresh log entry...')
    await supabasePost('refresh_logs', {
      scan_id: scanId,
      user_id: userId,
      industry: industry,
      triggered_by: 'manual', // Always 'manual' when called from frontend (scheduled overrides in run-scheduled-scans.mts)
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',  // ← Was 'success', now 'completed' (matches ActivityView.tsx)
      new_alerts_count: insertedAlerts.length,
      new_insights_count: insertedInsights.length,
      new_news_count: insertedNews.length
    })
    console.log('[FINALIZE] Refresh log created')
  } else {
    await supabasePatch('scans', `id=eq.${scanId}`, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      competitors_count: insertedCompetitors.length,
      alerts_count: insertedAlerts.length,
      insights_count: insertedInsights.length,
      news_count: insertedNews.length,
      industry_analytics: industryAnalytics
    })
  }
  
  console.log('[FINALIZE] ✅ Scan completed successfully')
  
  return {
    competitors: insertedCompetitors.length,
    alerts: insertedAlerts.length,
    insights: insertedInsights.length,
    news: insertedNews.length
  }
}

// ========== OLD MONOLITHIC STEP (DEPRECATED) ==========
// Step 3: Analyze with Claude + write everything to Supabase (supports incremental scans)
async function stepAnalyzeAndWrite(industry: string, scanId: string, companies: any[], news: any[], isRefresh?: boolean, userId?: string) {
  // Kept for backward compatibility but require auth
  if (!userId) {
    throw new Error('Authentication required')
  }
  const actualUserId = userId
  // If refresh, fetch existing competitors to use in insights/alerts generation
  let competitorNames: string[] = []
  if (isRefresh) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&select=name`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      if (!res.ok) {
        console.error('Failed to fetch competitors:', res.status, await res.text())
      } else {
        const existingCompetitors = await res.json()
        competitorNames = existingCompetitors?.map((c: any) => c.name) || []
        console.log('Fetched competitors for refresh:', competitorNames.length, competitorNames.slice(0, 3))
      }
    } catch (e) {
      console.error('Error fetching competitors:', e)
    }
  } else {
    competitorNames = companies.map((c: any) => c.name)
  }
  
  // If refresh, filter out duplicate news based on source_url
  let newNewsOnly = news
  if (isRefresh) {
    try {
      const existingNewsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/news_feed?scan_id=eq.${scanId}&select=source_url`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      if (existingNewsRes.ok) {
        const existingNews = await existingNewsRes.json()
        const existingUrls = new Set(
          existingNews.map((n: any) => n.source_url).filter(Boolean)
        )
        newNewsOnly = news.filter((n: any) => n.url && !existingUrls.has(n.url))
        console.log(`[REFRESH] Filtered news: ${news.length} total, ${newNewsOnly.length} new, ${existingUrls.size} existing`)
      }
    } catch (e) {
      console.error('Error fetching existing news:', e)
      // On error, proceed with all news
    }
    
    // If no new news during refresh, skip AI analysis
    if (newNewsOnly.length === 0) {
      console.log('[REFRESH] No new news - skipping insights/alerts generation')
      return {
        competitors: 0,
        alerts: 0,
        insights: 0,
        news: 0
      }
    }
  }
  
  // Fallback: if no competitors found, skip insights/alerts generation
  if (competitorNames.length === 0 && newNewsOnly.length === 0) {
    console.warn('No competitors or news - skipping insights/alerts')
    return {
      competitors: 0,
      alerts: 0,
      insights: 0,
      news: 0
    }
  }
  
  // Run AI analyses (skip competitors analysis if incremental scan)
  const promises: Promise<string>[] = []
  
  // Only analyze competitors on first scan (not on refresh)
  if (!isRefresh) {
    promises.push(
      poeRequest(`Analyze ${industry} companies. Each: threat_score(0-10), activity_level(low/medium/high), description, employee_count, stock_ticker (if publicly traded, use format like "AAPL", "MSFT", "TSE:RY" for Toronto, "EPA:BNP" for Paris etc. Use null if private).
Companies: ${companies.map((c: any) => c.name).join(', ')}
JSON array only: [{"name":"X","threat_score":7.5,"activity_level":"high","description":"Desc","employee_count":500,"industry":"${industry}","stock_ticker":"AAPL"}]`)
    )
  }
  
  // Always generate new insights and alerts (even on refresh) - but only from NEW news
  promises.push(
    poeRequest(`3-4 strategic insights for ${industry}.
Companies: ${competitorNames.slice(0,5).join(', ')}
News: ${newNewsOnly.slice(0,8).map((n: any) => n.title).join('; ')}
JSON: [{"type":"threat|opportunity|trend|recommendation","title":"X","description":"2-3 sentences","confidence":0.85,"impact":"high","action_items":["X"]}]`),
    
    poeRequest(`5-7 alerts from ${industry} news.
Companies: ${competitorNames.slice(0,8).join(', ')}
News: ${newNewsOnly.slice(0,12).map((n: any) => n.title).join('; ')}
JSON: [{"title":"X","description":"Context","priority":"critical|attention|info","category":"funding|product|hiring|news|market"}]`)
  )

  const results = await Promise.all(promises)
  
  let analyzed: any[] = []
  let insights: any[] = []
  let alerts: any[] = []
  
  if (isRefresh) {
    // Only 2 promises: insights, alerts
    insights = parseJsonArray(results[0])
    alerts = parseJsonArray(results[1])
  } else {
    // 3 promises: competitors, insights, alerts
    analyzed = parseJsonArray(results[0])
    insights = parseJsonArray(results[1])
    alerts = parseJsonArray(results[2])
  }

  // Fetch stock prices via Perplexity for public companies (only on first scan, not refresh)
  const publicCompanies = analyzed.filter((c: any) => c.stock_ticker)
  let stockPrices: Record<string, { price: number; currency: string; change_percent: number }> = {}
  
  if (publicCompanies.length > 0) {
    try {
      const tickers = publicCompanies.map((c: any) => `${c.name} (${c.stock_ticker})`).join(', ')
      const stockRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'Financial data analyst. Respond with valid JSON only. No markdown.' },
            { role: 'user', content: `Current stock prices for these companies: ${tickers}
JSON object with ticker as key: {"AAPL": {"price": 178.50, "currency": "USD", "change_percent": -1.2}, "TSE:RY": {"price": 145.30, "currency": "CAD", "change_percent": 0.5}}` }
          ],
          temperature: 0.2, max_tokens: 1500
        })
      })
      const stockData = await stockRes.json()
      const stockContent = stockData?.choices?.[0]?.message?.content
      if (stockContent) {
        // Remove markdown code fences if present
        const cleaned = stockContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) {
          stockPrices = JSON.parse(match[0].replace(/,(\s*[}\]])/g, '$1'))
        }
      }
    } catch (e) {
      console.error('Stock price fetch error:', e)
    }
  }

  // Write competitors to Supabase (only on first scan, not refresh)
  const insertedCompetitors = !isRefresh && analyzed.length > 0 ? await supabasePost('competitors', 
    analyzed.map((c: any) => {
      const stockInfo = c.stock_ticker ? stockPrices[c.stock_ticker] : null
      return {
        user_id: actualUserId, scan_id: scanId,
        name: c.name, domain: companies.find((co: any) => co.name === c.name)?.domain || null,
        industry: c.industry || industry, threat_score: c.threat_score || 5.0,
        activity_level: c.activity_level || 'medium', description: c.description || '',
        employee_count: c.employee_count || null,
        stock_ticker: c.stock_ticker || null,
        stock_price: stockInfo?.price || null,
        stock_currency: stockInfo?.currency || null,
        stock_change_percent: stockInfo?.change_percent || null,
        sentiment_score: Math.random() * 0.5 + 0.3,
        last_activity_date: new Date().toISOString()
      }
    })
  ) : []

  // Fetch existing alert titles to avoid duplicates
  let existingAlertTitles = new Set<string>()
  if (isRefresh) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}&select=title`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      const existingAlerts = await res.json()
      existingAlertTitles = new Set(existingAlerts.map((a: any) => a.title))
      console.log(`[REFRESH] Found ${existingAlertTitles.size} existing alert titles`)
    } catch (e) {
      console.error('Error fetching existing alerts:', e)
    }
  }

  // Filter out alerts with duplicate titles
  const newAlerts = alerts.filter((a: any) => !existingAlertTitles.has(a.title))
  console.log(`[REFRESH] Alerts: ${alerts.length} generated, ${newAlerts.length} unique (filtered ${alerts.length - newAlerts.length} duplicates)`)

  // Always insert new alerts (accumulate over time, skip duplicates)
  const insertedAlerts = newAlerts.length > 0 ? await supabasePost('alerts',
    newAlerts.map((a: any) => ({
      user_id: actualUserId, scan_id: scanId,
      competitor_id: insertedCompetitors[0]?.id || null,
      title: a.title, description: a.description,
      priority: a.priority || 'info', category: a.category || 'news', read: false,
      is_new: true,
      added_at: new Date().toISOString()
    }))
  ) : []

  // Fetch existing insight titles to avoid duplicates
  let existingInsightTitles = new Set<string>()
  if (isRefresh) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}&select=title`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      const existingInsights = await res.json()
      existingInsightTitles = new Set(existingInsights.map((i: any) => i.title))
      console.log(`[REFRESH] Found ${existingInsightTitles.size} existing insight titles`)
    } catch (e) {
      console.error('Error fetching existing insights:', e)
    }
  }

  // Filter out insights with duplicate titles
  const newInsights = insights.filter((i: any) => !existingInsightTitles.has(i.title))
  console.log(`[REFRESH] Insights: ${insights.length} generated, ${newInsights.length} unique (filtered ${insights.length - newInsights.length} duplicates)`)

  // Always insert new insights (accumulate over time, skip duplicates)
  const insertedInsights = newInsights.length > 0 ? await supabasePost('insights',
    newInsights.map((i: any) => ({
      user_id: actualUserId, scan_id: scanId,
      type: i.type || 'recommendation', title: i.title, description: i.description,
      confidence: i.confidence || 0.7, impact: i.impact || 'medium',
      action_items: i.action_items || [],
      is_new: true,
      added_at: new Date().toISOString()
    }))
  ) : []

  // Insert only NEW news (already filtered for duplicates during refresh)
  const insertedNews = newNewsOnly.length > 0 ? await supabasePost('news_feed',
    newNewsOnly.map((n: any) => ({
      user_id: actualUserId, scan_id: scanId,
      title: n.title, summary: n.summary || n.description,
      source: n.source || 'Perplexity', source_url: n.url || null,
      relevance_score: 0.5, sentiment: 'neutral', tags: n.tags || [],
      is_new: true,
      added_at: new Date().toISOString()
    }))
  ) : []

  // Generate industry analytics (only on first scan, reuse on refresh)
  let industryAnalytics = null
  
  if (isRefresh) {
    // Fetch existing analytics from current scan
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&select=industry_analytics`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const currentScan = await res.json()
    if (currentScan && currentScan.length > 0) {
      industryAnalytics = currentScan[0].industry_analytics
    }
  }
  
  // Generate analytics if not found (either new scan or missing from refresh)
  if (!industryAnalytics) {
    // Generate fresh industry analytics via Perplexity (for real data + citations)
    const analyticsRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'Market research analyst. Respond with valid JSON only. No markdown, no code fences. Use real, sourced data from recent industry reports (2024-2026 only).' },
          { role: 'user', content: `Provide detailed market analytics data for the ${industry} industry based on real market research reports and data from 2024-2026 only. Do not use outdated data.

Include a "sources" array with the report names and URLs you used.

JSON object only:
{
  "market_size_billions": 150,
  "market_size_year": 2025,
  "projected_size_billions": 220,
  "projected_year": 2030,
  "cagr_percent": 8.5,
  "top_segments": [{"name": "Segment A", "share_percent": 35}],
  "growth_drivers": ["Driver 1", "Driver 2", "Driver 3"],
  "key_trends": [{"trend": "Trend name", "impact": "high|medium|low", "description": "1 sentence"}],
  "funding_activity": {"total_billions": 12, "deal_count": 350, "avg_deal_millions": 34, "yoy_change_percent": 15},
  "market_leaders_share": [{"name": "Company", "share_percent": 15}],
  "regional_distribution": [{"region": "North America", "share_percent": 40}],
  "sources": [{"name": "Report or source name", "url": "https://..."}]
}
Use the actual known competitor names from this list where possible: ${analyzed.slice(0,8).map((c: any) => c.name).join(', ')}` }
        ],
        temperature: 0.3, max_tokens: 3000
      })
    })
    const analyticsData = await analyticsRes.json()
    const analyticsContent = analyticsData?.choices?.[0]?.message?.content
    // Also capture Perplexity citations if available
    const perplexityCitations = analyticsData?.citations || []

    try {
      if (analyticsContent) {
        const match = analyticsContent.match(/\{[\s\S]*\}/)
        if (match) {
          industryAnalytics = JSON.parse(match[0].replace(/,(\s*[}\]])/g, '$1'))
          // Merge Perplexity citations into sources if not already present
          if (perplexityCitations.length > 0 && !industryAnalytics.sources) {
            industryAnalytics.sources = perplexityCitations.map((url: string) => ({ name: url.split('/')[2] || url, url }))
          }
        }
      }
    } catch (e) {
      console.error('Analytics parse error:', e)
    }
  }

  // Mark scan as completed - increment counts for refresh, set for new scan
  if (isRefresh) {
    // ✅ RESET is_new FLAGS FOR EXISTING ITEMS (before counting new ones)
    console.log('[ANALYZE-REFRESH] Resetting is_new flags for existing items in this scan...')
    
    await fetch(`${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    await fetch(`${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    await fetch(`${SUPABASE_URL}/rest/v1/news_feed?scan_id=eq.${scanId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_new: false })
    })
    
    console.log('[ANALYZE-REFRESH] All existing items marked as is_new=false')
    
    // Fetch current counts
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&select=alerts_count,insights_count,news_count`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const currentScan = await res.json()
    const current = currentScan[0] || { alerts_count: 0, insights_count: 0, news_count: 0 }
    
    // Increment counts
    await supabasePatch('scans', `id=eq.${scanId}`, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      alerts_count: current.alerts_count + insertedAlerts.length,
      insights_count: current.insights_count + insertedInsights.length,
      news_count: current.news_count + insertedNews.length
    })
    
    // ✅ CREATE OR UPDATE REFRESH LOG
    // Check if run-scheduled-scans already created a 'running' log
    const existingLogRes = await fetch(
      `${SUPABASE_URL}/rest/v1/refresh_logs?scan_id=eq.${scanId}&status=eq.running&order=started_at.desc&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const existingLogs = await existingLogRes.json()
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log (from cron)
      console.log('[ANALYZE] Updating existing refresh_log (cron-created)')
      await supabasePatch('refresh_logs', `id=eq.${existingLogs[0].id}`, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        new_alerts_count: insertedAlerts.length,
        new_insights_count: insertedInsights.length,
        new_news_count: insertedNews.length
      })
    } else {
      // Create new log (manual refresh)
      console.log('[ANALYZE] Creating new refresh_log entry (manual refresh)')
      await supabasePost('refresh_logs', {
        scan_id: scanId,
        user_id: actualUserId,
        industry: industry,
        triggered_by: 'manual',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        new_alerts_count: insertedAlerts.length,
        new_insights_count: insertedInsights.length,
        new_news_count: insertedNews.length
      })
    }
    console.log('[ANALYZE] Refresh log complete')
  } else {
    // Set counts for new scan
    await supabasePatch('scans', `id=eq.${scanId}`, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      competitors_count: insertedCompetitors.length,
      alerts_count: insertedAlerts.length,
      insights_count: insertedInsights.length,
      news_count: insertedNews.length,
      industry_analytics: industryAnalytics
    })
  }

  return {
    competitors: insertedCompetitors.length,
    alerts: insertedAlerts.length,
    insights: insertedInsights.length,
    news: insertedNews.length
  }
}

// ========== HANDLER ==========

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) }
  }

  try {
    const { step, industry, scanId, companies, news, companyUrl, companyName, maxCompetitors, regions, watchlist, isRefresh, userId } = JSON.parse(event.body || '{}')
    
    if (!step) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'step required' }) }
    }

    // detect step doesn't need industry
    if (step !== 'detect' && !industry) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'industry required' }) }
    }

    let result: any

    switch (step) {
      case 'detect':
        if (!companyUrl) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'companyUrl required for detect step' }) }
        }
        result = await stepDetect(companyUrl)
        break
      case 'init':
        const { isScheduled } = JSON.parse(event.body || '{}')
        result = await stepInit(industry, companyUrl, companyName, userId, isScheduled, isRefresh)
        break
      case 'competitors':
        result = await stepCompetitors(industry, scanId, companyUrl, maxCompetitors, regions, watchlist, userId)
        break
      case 'news':
        result = await stepNews(industry)
        break
      case 'analyze':
        if (!scanId) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'scanId required for analyze step' }) }
        }
        // DEPRECATED - use analyze-competitors, analyze-insights, analyze-alerts, finalize instead
        result = await stepAnalyzeAndWrite(industry, scanId, companies || [], news || [], isRefresh, userId)
        break
      
      // NEW SPLIT STEPS
      case 'analyze-competitors':
        if (!scanId) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'scanId required' }) }
        }
        result = await stepAnalyzeCompetitors(industry, scanId, companies || [], userId)
        break
        
      case 'analyze-insights':
        if (!scanId) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'scanId required' }) }
        }
        const { competitorNames: insightCompNames } = JSON.parse(event.body || '{}')
        result = await stepAnalyzeInsights(industry, scanId, news || [], insightCompNames || [], userId)
        break
        
      case 'analyze-alerts':
        if (!scanId) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'scanId required' }) }
        }
        const { competitorNames: alertCompNames } = JSON.parse(event.body || '{}')
        result = await stepAnalyzeAlerts(industry, scanId, news || [], alertCompNames || [], userId)
        break
        
      case 'finalize':
        if (!scanId) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'scanId required' }) }
        }
        const { competitors: finalizeCompetitors, insights: finalizeInsights, alerts: finalizeAlerts } = JSON.parse(event.body || '{}')
        result = await stepFinalize(
          industry, 
          scanId, 
          finalizeCompetitors || [], 
          finalizeInsights || [], 
          finalizeAlerts || [], 
          news || [], 
          isRefresh || false, 
          userId
        )
        break
      
      default:
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown step: ${step}` }) }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, step, ...result })
    }

  } catch (error: any) {
    console.error(`Step error:`, error)
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message, success: false })
    }
  }
}

export { handler }
