# Watchlist Improvements - Phase 2.1

## Issues Identified (March 11, 2026)

### 1. Removed Watchlist Items Not Replaced

**Current behavior:**
- User removes competitor from watchlist → Refresh
- Competitor deleted from scan
- ❌ No replacement added (total count decreases)

**Example:**
```
Before: 5 competitors (2 watchlist + 3 auto)
Remove 1 watchlist → Refresh
After: 4 competitors (1 watchlist + 3 auto) ❌
Expected: 5 competitors (1 watchlist + 4 auto) ✅
```

**Solution:**
When removing watchlist items during refresh:
1. Count how many watchlist items removed
2. Re-fetch competitors from AI (same number)
3. Insert as auto-discovered (is_watchlist=FALSE)
4. Maintain total at max limit

**Implementation:**
```typescript
// In refresh-scan.mts after DELETE removed watchlist
if (removedItems.length > 0) {
  const spaceFree = removedItems.length
  
  // Re-fetch competitors to fill the gap
  const newAutoCompetitors = await stepCompetitors({
    industry: scan.industry,
    watchlist: [], // Don't pass watchlist (we want auto-discovered)
    maxCompetitors: spaceFree,
    existingCompetitors: currentCompetitors.map(c => c.name)
  })
  
  await supabasePost('competitors', newAutoCompetitors.map(c => ({
    ...c,
    scan_id: scanId,
    user_id: userId,
    is_watchlist: false
  })))
  
  console.log(`[REFRESH] ✅ Backfilled ${spaceFree} auto-discovered competitors`)
}
```

---

### 2. Watchlist Competitors Missing Details

**Current behavior:**
- Watchlist items inserted with minimal data:
  ```typescript
  {
    name: 'Ford',
    threat_score: 7.0,
    description: 'User-added watchlist competitor',  // ❌ Generic
    employee_count: null,  // ❌ Missing
    domain: null,  // ❌ Missing
    stock_ticker: null  // ❌ Missing
  }
  ```

**AI-discovered competitors get full details:**
```typescript
{
  name: 'Tesla',
  threat_score: 8.5,
  description: 'Leading electric vehicle manufacturer...',  // ✅ Rich
  employee_count: 127855,  // ✅ Present
  domain: 'tesla.com',  // ✅ Present
  stock_ticker: 'TSLA'  // ✅ Present
}
```

**Problem:** Watchlist competitors look incomplete compared to AI ones

---

## Solution: Enrich Watchlist Items

### Option A: Quick Enrichment (Perplexity single query)

When inserting new watchlist item:
```typescript
const enrichedData = await enrichCompetitor(item, industry)

await supabasePost('competitors', {
  ...baseFields,
  ...enrichedData,  // description, employee_count, domain, etc.
  is_watchlist: true
})
```

**enrichCompetitor() function:**
```typescript
async function enrichCompetitor(name: string, industry: string) {
  const prompt = `Provide brief company info for ${name} in ${industry}:
  - 1-sentence description
  - Employee count (number or null)
  - Primary domain (without http)
  - Stock ticker (if public)
  Return JSON: { description, employee_count, domain, stock_ticker }`
  
  const response = await callPoeAPI(prompt)
  return JSON.parse(response)
}
```

### Option B: Batch Enrichment (one Perplexity call for all new watchlist items)

```typescript
if (itemsToInsert.length > 0) {
  const enrichedCompetitors = await enrichWatchlistBatch(itemsToInsert, industry)
  await supabasePost('competitors', enrichedCompetitors)
}
```

**Recommended:** Option B (more efficient, 1 API call instead of N)

---

## Implementation Plan

### Task 1: Backfill Removed Watchlist Items (30 min)
1. After DELETE removed watchlist competitors
2. Calculate spaceFree = removedItems.length
3. Re-call stepCompetitors with maxCompetitors=spaceFree
4. Insert as auto-discovered (is_watchlist=FALSE)
5. Log: `[REFRESH] ✅ Backfilled X competitors`

### Task 2: Enrich Watchlist Competitors (45 min)
1. Create enrichWatchlistBatch() helper
2. Prompt Perplexity for batch company info
3. Parse JSON response with company details
4. Insert enriched data instead of minimal stub
5. Fallback to minimal if enrichment fails

### Task 3: Testing (20 min)
1. Remove watchlist item → Refresh → Verify backfill
2. Add new watchlist item → Verify enriched data
3. Check UI: Watchlist and auto competitors have similar detail level

**Total estimate:** 1.5 hours

---

## User Experience Improvements

### Before:
```
Watchlist item:
- Name: Ford ✅
- Description: "User-added watchlist competitor" ❌ Generic
- Employee count: - ❌ Missing
- Domain: - ❌ Missing
```

### After:
```
Watchlist item:
- Name: Ford ✅
- Description: "American automotive manufacturer, second-largest in US..." ✅
- Employee count: 173,000 ✅
- Domain: ford.com ✅
- Stock ticker: F ✅
```

**Looks identical to AI-discovered competitors!** User can't tell the difference! 🎨

---

## Files to Modify

1. **refresh-scan.mts:** Add backfill logic after DELETE
2. **scan-step.mts:** Extract/create enrichWatchlistBatch() helper
3. **Both:** Use enriched data when inserting watchlist items

---

Ready to implement? Priority: Task 1 (backfill) > Task 2 (enrich)
