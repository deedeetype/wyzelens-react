/**
 * WyzeLens Refresh Scan Function
 * Dedicated endpoint for refreshing existing scans (manual or scheduled)
 * Separates refresh logic from new scan creation for cleaner architecture
 */

import type { Handler } from "@netlify/functions"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY
const POE_KEY = process.env.POE_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

// ========== UTILITY FUNCTIONS ==========

function parseJsonArray(text: string) {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (match) {
      const fixed = match[0].replace(/,(\s*[}\]])/g, '$1')
      return JSON.parse(fixed)
    }
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
      max_tokens: 3000
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}

// ========== REFRESH LOGIC ==========

async function validateRefreshLimits(userId: string, scanId: string, isScheduled: boolean) {
  console.log(`[REFRESH] Validating limits for user ${userId}, isScheduled: ${isScheduled}`)
  
  // Skip validation if scheduled (cron has its own timing logic)
  if (isScheduled) {
    console.log('[REFRESH] Scheduled refresh - skipping manual limits')
    return { allowed: true }
  }
  
  // Fetch user subscription
  const subRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${userId}&select=plan`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  const subs = await subRes.json()
  const plan = subs?.[0]?.plan || 'free'
  
  console.log(`[REFRESH] User plan: ${plan}`)
  
  // Plan-based daily limits (manual refresh only)
  const dailyLimits: Record<string, number> = {
    free: 1,
    starter: 3,
    pro: 999,
    business: 999,
    enterprise: 999
  }
  
  const dailyLimit = dailyLimits[plan] || 1
  
  // Count manual refreshes today (UTC day)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayISO = today.toISOString()
  
  const logsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/refresh_logs?scan_id=eq.${scanId}&triggered_by=eq.manual&started_at=gte.${todayISO}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  const logs = await logsRes.json()
  const manualRefreshCount = logs?.length || 0
  
  console.log(`[REFRESH] Manual refresh count today: ${manualRefreshCount}/${dailyLimit}`)
  
  if (manualRefreshCount >= dailyLimit) {
    throw new Error(`Manual refresh limit reached (${dailyLimit}/day for ${plan} plan). Upgrade for more refreshes.`)
  }
  
  return { allowed: true, count: manualRefreshCount, limit: dailyLimit }
}

async function fetchLatestNews(industry: string) {
  console.log(`[REFRESH] Fetching latest news for ${industry}`)
  
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'News analyst. Respond with valid JSON only. Extract ACTUAL publication dates from articles.' },
        { role: 'user', content: `Find 20 most recent ${industry} news articles published between ${sevenDaysAgo} and ${today}.

CRITICAL: Extract ACTUAL publication date from each article. If published today (${today}), use today's date.

PRIORITIZE:
1. Articles published TODAY (${today})
2. Articles from last 3 days
3. Articles from last 7 days

JSON array: [{
  "title": "Article title",
  "summary": "2-3 sentence summary",
  "source": "Publication name",
  "url": "https://...",
  "tags": ["tag1", "tag2"],
  "published_at": "YYYY-MM-DDTHH:MM:SSZ"
}]` }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })
  })
  
  const data = await res.json()
  const news = parseJsonArray(data.choices[0].message.content)
    .filter((n: any) => n.title && n.url && n.published_at)
    .slice(0, 20)
  
  console.log(`[REFRESH] Fetched ${news.length} news articles`)
  return news
}

async function generateInsightsAndAlerts(industry: string, news: any[], competitorNames: string[]) {
  console.log(`[REFRESH] Generating insights and alerts for ${industry}`)
  
  const insightsPrompt = `3-4 strategic insights for ${industry}.
Companies: ${competitorNames.slice(0, 5).join(', ')}
News: ${news.slice(0, 8).map((n: any) => n.title).join('; ')}
JSON: [{"type":"threat|opportunity|trend|recommendation","title":"X","description":"2-3 sentences","confidence":0.85,"impact":"high","action_items":["X"]}]`

  const alertsPrompt = `5-7 alerts from ${industry} news.
Companies: ${competitorNames.slice(0, 8).join(', ')}
News: ${news.slice(0, 12).map((n: any) => n.title).join('; ')}
JSON: [{"title":"X","description":"Context","priority":"critical|attention|info","category":"funding|product|hiring|news|market"}]`

  const [insightsResponse, alertsResponse] = await Promise.all([
    poeRequest(insightsPrompt),
    poeRequest(alertsPrompt)
  ])
  
  const insights = parseJsonArray(insightsResponse)
  const alerts = parseJsonArray(alertsResponse)
  
  console.log(`[REFRESH] Generated ${insights.length} insights, ${alerts.length} alerts`)
  
  return { insights, alerts }
}

async function filterDuplicates(scanId: string, userId: string, news: any[], insights: any[], alerts: any[]) {
  console.log(`[REFRESH] Filtering duplicates for scan ${scanId}`)
  
  // Fetch existing titles/URLs
  const [existingAlertsRes, existingInsightsRes, existingNewsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}&select=title`, {
      headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}&select=title`, {
      headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/news_feed?user_id=eq.${userId}&select=source_url`, {
      headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
  ])
  
  const existingAlerts = await existingAlertsRes.json()
  const existingInsights = await existingInsightsRes.json()
  const existingNews = await existingNewsRes.json()
  
  const existingAlertTitles = new Set(existingAlerts.map((a: any) => a.title))
  const existingInsightTitles = new Set(existingInsights.map((i: any) => i.title))
  const existingNewsUrls = new Set(existingNews.map((n: any) => n.source_url))
  
  const newAlerts = alerts.filter((a: any) => !existingAlertTitles.has(a.title))
  const newInsights = insights.filter((i: any) => !existingInsightTitles.has(i.title))
  const newNews = news.filter((n: any) => !existingNewsUrls.has(n.url))
  
  console.log(`[REFRESH] Filtered: ${newAlerts.length}/${alerts.length} alerts, ${newInsights.length}/${insights.length} insights, ${newNews.length}/${news.length} news`)
  
  return { newAlerts, newInsights, newNews }
}

// ========== MAIN HANDLER ==========

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) }
  }
  
  try {
    const { scanId, userId, triggeredBy, watchlist, maxCompetitors } = JSON.parse(event.body || '{}')
    
    console.log(`[REFRESH] Starting refresh for scan ${scanId}, triggered by: ${triggeredBy}`)
    
    if (!scanId || !userId || !triggeredBy) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'scanId, userId, and triggeredBy required' })
      }
    }
    
    const isScheduled = triggeredBy === 'scheduled'
    
    // ✅ LOG WATCHLIST PARAMETER
    if (watchlist && watchlist.length > 0) {
      console.log(`[REFRESH] Watchlist provided: ${watchlist.length} items - ${watchlist.join(', ')}`)
    } else {
      console.log(`[REFRESH] No watchlist provided`)
    }
    
    // Step 1: Validate limits (skip if scheduled)
    await validateRefreshLimits(userId, scanId, isScheduled)
    
    // Step 2: Fetch scan details
    const scanRes = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&select=industry,company_url,company_name,alerts_count,insights_count,news_count`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const scans = await scanRes.json()
    const scan = scans?.[0]
    
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`)
    }
    
    console.log(`[REFRESH] Scan found: ${scan.industry}`)
    
    // Step 3: Fetch existing competitors (for insights/alerts context)
    const competitorsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&select=name,is_watchlist`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    const competitors = await competitorsRes.json()
    const competitorNames = competitors?.map((c: any) => c.name) || []
    const watchlistCompetitors = competitors?.filter((c: any) => c.is_watchlist).map((c: any) => c.name) || []
    
    console.log(`[REFRESH] Found ${competitorNames.length} competitors (${watchlistCompetitors.length} from watchlist)`)
    
    // ✅ WATCHLIST CHANGE DETECTION
    if (watchlistCompetitors.length > 0) {
      console.log(`[REFRESH] Existing watchlist competitors: ${watchlistCompetitors.join(', ')}`)
    }
    
    // ✅ CHECK IF WATCHLIST CHANGED
    let watchlistChanged = false
    let addedItems: string[] = []
    let removedItems: string[] = []
    
    if (watchlist && watchlist.length > 0) {
      // Normalize for comparison (case-insensitive, URL-aware)
      const normalizeItem = (item: string): string => {
        const lower = item.toLowerCase().trim()
        // Extract domain from URL if needed
        if (lower.startsWith('http://') || lower.startsWith('https://') || lower.includes('.com')) {
          try {
            return lower.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
          } catch (e) {
            return lower
          }
        }
        return lower
      }
      
      const currentWatchlistNormalized = watchlistCompetitors.map(normalizeItem)
      const newWatchlistNormalized = watchlist.map(normalizeItem)
      
      // Find added and removed items
      addedItems = newWatchlistNormalized.filter(w => !currentWatchlistNormalized.includes(w))
      removedItems = currentWatchlistNormalized.filter(w => !newWatchlistNormalized.includes(w))
      watchlistChanged = addedItems.length > 0 || removedItems.length > 0
      
      if (watchlistChanged) {
        console.log(`[REFRESH] ✨ Watchlist changed detected!`)
        console.log(`[REFRESH] Added: ${addedItems.length} items - ${addedItems.join(', ')}`)
        console.log(`[REFRESH] Removed: ${removedItems.length} items - ${removedItems.join(', ')}`)
      } else {
        console.log(`[REFRESH] Watchlist unchanged - no competitor updates needed`)
      }
    }
    
    // Step 4: Reset is_new flags on ALL existing items
    console.log('[REFRESH] Resetting is_new flags...')
    await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_new: false })
      }),
      fetch(`${SUPABASE_URL}/rest/v1/insights?scan_id=eq.${scanId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_new: false })
      }),
      fetch(`${SUPABASE_URL}/rest/v1/news_feed?scan_id=eq.${scanId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_new: false })
      })
    ])
    
    console.log('[REFRESH] Flags reset complete')
    
    // Step 4.5: Update competitors if watchlist changed
    if (watchlistChanged && addedItems.length > 0) {
      console.log(`[REFRESH] Updating competitors list...`)
      
      // Fetch current competitors with scores
      const currentCompetitorsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&select=*&order=threat_score.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      const currentCompetitors = await currentCompetitorsRes.json()
      
      const autoDiscovered = currentCompetitors.filter((c: any) => !c.is_watchlist)
      const max = maxCompetitors || 10
      
      // ✅ CHECK IF ADDED ITEMS ALREADY EXIST (as auto-discovered)
      // Convert existing competitors to watchlist instead of creating duplicates
      const normalizeForMatch = (str: string): string => {
        return str.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      }
      
      const itemsToInsert: string[] = []
      const itemsToConvert: any[] = []
      
      for (const item of addedItems) {
        const normalized = normalizeForMatch(item)
        
        // Check if competitor already exists (by name or domain)
        const existing = currentCompetitors.find((c: any) => {
          const cName = normalizeForMatch(c.name)
          const cDomain = normalizeForMatch(c.domain || '')
          return cName === normalized || cDomain === normalized || 
                 cName.includes(normalized) || normalized.includes(cName)
        })
        
        if (existing) {
          console.log(`[REFRESH] Competitor '${item}' already exists as '${existing.name}' (id: ${existing.id}) - converting to watchlist`)
          itemsToConvert.push(existing)
        } else {
          console.log(`[REFRESH] Competitor '${item}' not found - will insert new`)
          itemsToInsert.push(item)
        }
      }
      
      // ✅ FIX: Calculate space needed for TRUE insertions only (conversions don't need space!)
      const totalAfterInsert = currentCompetitors.length + itemsToInsert.length
      const toRemove = Math.max(0, totalAfterInsert - max)
      
      console.log(`[REFRESH] Current: ${currentCompetitors.length}, Converting: ${itemsToConvert.length}, Inserting: ${itemsToInsert.length}, Max: ${max}, To remove: ${toRemove}`)
      
      // Remove lowest-score auto-discovered (only if needed for NEW insertions)
      if (toRemove > 0 && autoDiscovered.length > 0) {
        const competitorsToRemove = autoDiscovered
          .sort((a: any, b: any) => a.threat_score - b.threat_score)
          .slice(0, Math.min(toRemove, autoDiscovered.length))
        
        const idsToRemove = competitorsToRemove.map((c: any) => c.id)
        
        console.log(`[REFRESH] Removing ${competitorsToRemove.length} low-score competitors:`, 
          competitorsToRemove.map((c: any) => `${c.name} (${c.threat_score})`))
        
        await fetch(
          `${SUPABASE_URL}/rest/v1/competitors?id=in.(${idsToRemove.join(',')})`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
          }
        )
      }
      
      // Convert existing competitors to watchlist (UPDATE is_watchlist=TRUE)
      if (itemsToConvert.length > 0) {
        const idsToConvert = itemsToConvert.map(c => c.id)
        await fetch(
          `${SUPABASE_URL}/rest/v1/competitors?id=in.(${idsToConvert.join(',')})`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_watchlist: true })
          }
        )
        console.log(`[REFRESH] ✅ Converted ${itemsToConvert.length} existing competitors to watchlist:`,
          itemsToConvert.map(c => c.name))
      }
      
      // ✅ INSERT NEW WATCHLIST COMPETITORS (with enrichment via Perplexity)
      if (itemsToInsert.length > 0) {
        console.log(`[REFRESH] Enriching ${itemsToInsert.length} new watchlist items...`)
        
        // Build enrichment prompt
        const enrichPrompt = `Provide detailed company information for these ${itemsToInsert.length} companies in the ${scan.industry} industry:

${itemsToInsert.map((item, i) => `${i+1}. ${item}`).join('\n')}

For EACH company, provide:
- name (official company name)
- domain (primary website domain without http, e.g. "tesla.com")
- description (2-3 sentences: what they do, market position, key differentiators)
- threat_score (1-10 rating based on market presence, innovation, competitive threat)
- activity_level (low/medium/high based on recent news/product launches)
- employee_count (approximate number as integer, or null if unknown)
- stock_ticker (if publicly traded, e.g. "TSLA", or null if private)
- position (e.g. "Market Leader", "Emerging Competitor", "Established Player")

Return EXACTLY ${itemsToInsert.length} companies as JSON array.

JSON format: [{"name": "Company", "domain": "example.com", "description": "...", "threat_score": 8.5, "activity_level": "high", "employee_count": 50000, "stock_ticker": "TICK", "position": "Market Leader"}]

Use current 2026 data.`

        let enriched: any[] = []
        
        try {
          const enrichRes = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${PERPLEXITY_KEY}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
              model: 'sonar-pro',
              messages: [
                { role: 'system', content: 'Business intelligence analyst. Provide accurate company data. JSON only.' },
                { role: 'user', content: enrichPrompt }
              ],
              temperature: 0.3,
              max_tokens: 2000
            })
          })
          
          if (enrichRes.ok) {
            const enrichData = await enrichRes.json()
            enriched = parseJsonArray(enrichData.choices[0].message.content)
            console.log(`[REFRESH] Enriched ${enriched.length}/${itemsToInsert.length} items`)
          } else {
            console.warn(`[REFRESH] Enrichment failed (${enrichRes.status}), using fallback`)
          }
        } catch (error) {
          console.error('[REFRESH] Enrichment error:', error)
        }
        
        // Build competitors with enriched data (fallback to minimal if enrichment failed)
        const newCompetitors = itemsToInsert.map((item, idx) => {
          const e = enriched[idx] || {}
          return {
            user_id: userId,
            scan_id: scanId,
            name: e.name || (item.charAt(0).toUpperCase() + item.slice(1)),
            domain: e.domain || (item.includes('.') ? item : null),
            industry: scan.industry,
            threat_score: e.threat_score || 7.0,
            activity_level: e.activity_level || 'medium',
            description: e.description || 'User-added watchlist competitor',
            employee_count: e.employee_count || null,
            stock_ticker: e.stock_ticker || null,
            stock_price: null,
            stock_currency: null,
            stock_change_percent: null,
            sentiment_score: 0.5,
            last_activity_date: new Date().toISOString(),
            is_watchlist: true
          }
        })
        
        await supabasePost('competitors', newCompetitors)
        
        console.log(`[REFRESH] ✅ Inserted ${newCompetitors.length} new watchlist competitors:`, 
          newCompetitors.map(c => `${c.name} (${c.employee_count || 'unknown'} employees)`))
      }
    }
    
    // Handle removed watchlist items
    if (watchlistChanged && removedItems.length > 0) {
      console.log(`[REFRESH] Removing ${removedItems.length} watchlist competitors from scan`)
      
      // Delete competitors that are no longer in watchlist
      const watchlistCompetitorsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&is_watchlist=eq.true&select=id,name`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      )
      const watchlistComps = await watchlistCompetitorsRes.json()
      
      const normalizeItem = (item: string): string => {
        return item.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      }
      
      const toRemoveIds = watchlistComps
        .filter((c: any) => removedItems.includes(normalizeItem(c.name)))
        .map((c: any) => c.id)
      
      if (toRemoveIds.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/competitors?id=in.(${toRemoveIds.join(',')})`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
          }
        )
        console.log(`[REFRESH] ✅ Removed ${toRemoveIds.length} watchlist competitors`)
        
        // ✅ BACKFILL: Re-fetch auto-discovered to maintain total count
        const spaceFree = toRemoveIds.length
        console.log(`[REFRESH] Backfilling ${spaceFree} auto-discovered competitors...`)
        
        // Fetch current competitor names (after deletion)
        const afterDeleteRes = await fetch(
          `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&select=name`,
          {
            headers: {
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
          }
        )
        const afterDelete = await afterDeleteRes.json()
        const existingNames = afterDelete.map((c: any) => c.name)
        
        // Build backfill prompt
        const backfillPrompt = `List EXACTLY ${spaceFree} companies in the ${scan.industry} industry.
EXCLUDE these existing competitors: ${existingNames.join(', ')}

For each company provide:
- name (official company name)
- domain (primary website without http)
- description (2-3 sentences)
- threat_score (1-10 rating)
- activity_level (low/medium/high)
- employee_count (integer or null)
- stock_ticker (if public, or null)
- position (e.g. "Established Competitor", "Emerging Player")

Return EXACTLY ${spaceFree} companies as JSON array.

JSON format: [{"name": "Company", "domain": "example.com", "description": "...", "threat_score": 7.5, "activity_level": "medium", "employee_count": 50000, "stock_ticker": "TICK", "position": "Established Competitor"}]

Use current 2026 data.`

        try {
          const backfillRes = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${PERPLEXITY_KEY}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
              model: 'sonar-pro',
              messages: [
                { role: 'system', content: 'Business intelligence analyst. Respond with valid JSON only.' },
                { role: 'user', content: backfillPrompt }
              ],
              temperature: 0.4,
              max_tokens: 2000
            })
          })
          
          if (backfillRes.ok) {
            const backfillData = await backfillRes.json()
            const backfillCompanies = parseJsonArray(backfillData.choices[0].message.content)
            
            if (backfillCompanies.length > 0) {
              const backfillCompetitors = backfillCompanies.map((c: any) => ({
                user_id: userId,
                scan_id: scanId,
                name: c.name || 'Unknown',
                domain: c.domain || null,
                industry: scan.industry,
                threat_score: c.threat_score || 6.0,
                activity_level: c.activity_level || 'medium',
                description: c.description || 'Auto-discovered competitor',
                employee_count: c.employee_count || null,
                stock_ticker: c.stock_ticker || null,
                stock_price: null,
                stock_currency: null,
                stock_change_percent: null,
                sentiment_score: 0.5,
                last_activity_date: new Date().toISOString(),
                is_watchlist: false  // ✅ Backfill = auto-discovered
              }))
              
              await supabasePost('competitors', backfillCompetitors)
              
              console.log(`[REFRESH] ✅ Backfilled ${backfillCompetitors.length} auto-discovered competitors:`,
                backfillCompetitors.map(c => c.name))
            } else {
              console.warn(`[REFRESH] Backfill returned 0 competitors`)
            }
          } else {
            console.warn(`[REFRESH] Backfill API failed (${backfillRes.status}), skipping backfill`)
          }
        } catch (error) {
          console.error('[REFRESH] Backfill error:', error)
          // Continue without backfill (doesn't block refresh)
        }
      }
    }
    
    // Step 5: Fetch latest news
    const news = await fetchLatestNews(scan.industry)
    
    // Step 6: Generate insights and alerts
    const { insights, alerts } = await generateInsightsAndAlerts(scan.industry, news, competitorNames)
    
    // Step 7: Filter duplicates
    const { newAlerts, newInsights, newNews } = await filterDuplicates(scanId, userId, news, insights, alerts)
    
    // Step 8: Insert new items with is_new=true
    const now = new Date().toISOString()
    
    const insertedAlerts = newAlerts.length > 0 ? await supabasePost('alerts',
      newAlerts.map((a: any) => ({
        user_id: userId,
        scan_id: scanId,
        competitor_id: null,
        title: a.title,
        description: a.description,
        priority: a.priority || 'info',
        category: a.category || 'news',
        read: false,
        is_new: true,
        added_at: now
      }))
    ) : []
    
    const insertedInsights = newInsights.length > 0 ? await supabasePost('insights',
      newInsights.map((i: any) => ({
        user_id: userId,
        scan_id: scanId,
        type: i.type || 'recommendation',
        title: i.title,
        description: i.description,
        confidence: i.confidence || 0.7,
        impact: i.impact || 'medium',
        action_items: i.action_items || [],
        is_new: true,
        added_at: now
      }))
    ) : []
    
    const insertedNews = newNews.length > 0 ? await supabasePost('news_feed',
      newNews.map((n: any) => ({
        user_id: userId,
        scan_id: scanId,
        title: n.title,
        summary: n.summary || '',
        source: n.source || 'Perplexity',
        source_url: n.url || null,
        relevance_score: 0.5,
        sentiment: 'neutral',
        tags: n.tags || [],
        published_at: n.published_at || now,
        is_new: true,
        added_at: now
      }))
    ) : []
    
    console.log(`[REFRESH] Inserted: ${insertedAlerts.length} alerts, ${insertedInsights.length} insights, ${insertedNews.length} news`)
    
    // Step 9: Update scan counts and metadata
    await supabasePatch('scans', `id=eq.${scanId}`, {
      status: 'completed',
      last_refreshed_at: now,
      refresh_count: (scan.refresh_count || 0) + 1,
      alerts_count: (scan.alerts_count || 0) + insertedAlerts.length,
      insights_count: (scan.insights_count || 0) + insertedInsights.length,
      news_count: (scan.news_count || 0) + insertedNews.length,
      updated_at: now
    })
    
    // Step 10: Create refresh_log entry
    await supabasePost('refresh_logs', {
      scan_id: scanId,
      user_id: userId,
      industry: scan.industry,
      triggered_by: triggeredBy,
      started_at: now,
      completed_at: now,
      status: 'completed',
      new_alerts_count: insertedAlerts.length,
      new_insights_count: insertedInsights.length,
      new_news_count: insertedNews.length
    })
    
    console.log('[REFRESH] Refresh log created')
    
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        scanId,
        counts: {
          alerts: insertedAlerts.length,
          insights: insertedInsights.length,
          news: insertedNews.length
        }
      })
    }
    
  } catch (error: any) {
    console.error('[REFRESH] Error:', error)
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
