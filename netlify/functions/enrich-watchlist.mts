/**
 * Enrich watchlist items with full company details via Perplexity
 * Returns same structure as stepCompetitors for consistency
 */

const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY
const POE_API_KEY = process.env.POE_API_KEY

function parseJsonArray(text: string): any[] {
  try {
    let cleaned = text.trim()
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '')
    
    if (!cleaned.startsWith('[')) {
      const match = cleaned.match(/\[[\s\S]*\]/)
      if (match) cleaned = match[0]
      else {
        const fixed = '[' + cleaned + ']'
        return JSON.parse(fixed)
      }
    }
    
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON parse error:', e, 'Raw text:', text.slice(0, 200))
    return []
  }
}

/**
 * Enrich a batch of watchlist items with full company details
 */
export async function enrichWatchlistBatch(
  items: string[], 
  industry: string,
  existingCompetitors: string[] = []
): Promise<any[]> {
  
  if (!items || items.length === 0) {
    return []
  }
  
  console.log(`[ENRICH-WATCHLIST] Enriching ${items.length} items: ${items.join(', ')}`)
  
  const prompt = `Provide detailed company information for these ${items.length} companies in the ${industry} industry:

${items.map((item, i) => `${i+1}. ${item}`).join('\n')}

For EACH company, provide:
- name (official company name)
- domain (primary website domain without http, e.g. "tesla.com")
- description (2-3 sentences: what they do, market position, key differentiators)
- threat_score (1-10 rating based on market presence, innovation, competitive threat)
- activity_level (low/medium/high based on recent news/product launches)
- employee_count (approximate number as integer, or null if unknown)
- stock_ticker (if publicly traded, e.g. "TSLA", or null if private)
- position (e.g. "Market Leader", "Emerging Competitor", "Established Player")

Return EXACTLY ${items.length} companies as JSON array. Order doesn't matter but count must match.

JSON format: [{
  name: "Company Name",
  domain: "example.com",
  description: "Brief description...",
  threat_score: 8.5,
  activity_level: "high",
  employee_count: 50000,
  stock_ticker: "TICK",
  position: "Market Leader"
}]

CRITICAL: Return ${items.length} results, one for each input. Use current 2026 data.`

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${PERPLEXITY_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { 
            role: 'system', 
            content: 'Business intelligence analyst. Provide accurate, current company data. Respond with valid JSON only. Include all requested fields for each company.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    })
    
    if (!res.ok) {
      console.error(`[ENRICH-WATCHLIST] Perplexity API error: ${res.status}`)
      return fallbackEnrichment(items, industry)
    }
    
    const data = await res.json()
    const enriched = parseJsonArray(data.choices[0].message.content)
    
    console.log(`[ENRICH-WATCHLIST] Received ${enriched.length}/${items.length} enriched items`)
    
    // Validate we got all items
    if (enriched.length < items.length) {
      console.warn(`[ENRICH-WATCHLIST] Missing ${items.length - enriched.length} items, using fallback for missing`)
      
      // Fill missing with fallback
      const enrichedNames = enriched.map((e: any) => e.name?.toLowerCase())
      const missing = items.filter(item => 
        !enrichedNames.includes(item.toLowerCase())
      )
      
      const fallbacks = fallbackEnrichment(missing, industry)
      return [...enriched, ...fallbacks]
    }
    
    return enriched
    
  } catch (error) {
    console.error('[ENRICH-WATCHLIST] Error:', error)
    return fallbackEnrichment(items, industry)
  }
}

/**
 * Fallback: Create minimal enriched data if Perplexity fails
 */
function fallbackEnrichment(items: string[], industry: string): any[] {
  return items.map(item => ({
    name: item.charAt(0).toUpperCase() + item.slice(1),
    domain: item.includes('.') ? item : null,
    description: `Competitor in ${industry} industry (user-added watchlist item)`,
    threat_score: 7.0,
    activity_level: 'medium',
    employee_count: null,
    stock_ticker: null,
    position: 'Watchlist Item'
  }))
}
