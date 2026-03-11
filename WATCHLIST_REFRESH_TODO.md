# TODO: Watchlist Refresh Implementation

**Status:** ⚠️ NOT YET IMPLEMENTED  
**Current behavior:** Refresh does NOT update competitors (only news/insights/alerts)

---

## 🐛 Issue

When user adds competitors to watchlist and clicks "Refresh":
- ❌ Watchlist changes are ignored
- ✅ News/insights/alerts are updated
- ❌ Competitors list stays the same

**Workaround:** User must create a NEW scan to include watchlist items.

---

## 🔧 Solution Needed

### Phase 2: Implement Watchlist Change Detection

**File:** `netlify/functions/refresh-scan.mts`

**Changes needed:**

1. **Accept watchlist parameter** from frontend
2. **Compare with existing competitors** (is_watchlist=true)
3. **If watchlist changed** → Re-fetch competitors
4. **Replace least relevant** auto-discovered with new watchlist items

---

## 📝 Implementation Steps

### 1. Frontend: Pass watchlist to refresh endpoint

**File:** `src/pages/Dashboard.tsx`

```typescript
// In handleRefreshProfile function
const response = await fetch('/.netlify/functions/refresh-scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scanId: profileId,
    userId: user.id,
    triggeredBy: 'manual',
    watchlist: settings.scanPreferences.watchlist  // ✅ ADD THIS
  })
})
```

### 2. Backend: Detect watchlist changes

**File:** `netlify/functions/refresh-scan.mts`

```typescript
async function detectWatchlistChanges(
  scanId: string, 
  currentWatchlist: string[]
): Promise<{ changed: boolean, added: string[], removed: string[] }> {
  
  // Fetch existing watchlist competitors from DB
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&is_watchlist=eq.true&select=name`,
    { headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const existingCompetitors = await res.json()
  const existingWatchlist = existingCompetitors.map((c: any) => c.name.toLowerCase())
  const newWatchlist = currentWatchlist.map(w => w.toLowerCase())
  
  const added = newWatchlist.filter(w => !existingWatchlist.includes(w))
  const removed = existingWatchlist.filter(w => !newWatchlist.includes(w))
  const changed = added.length > 0 || removed.length > 0
  
  console.log(`[WATCHLIST] Change detection:`, {
    existing: existingWatchlist,
    new: newWatchlist,
    added,
    removed,
    changed
  })
  
  return { changed, added, removed }
}
```

### 3. Backend: Re-fetch competitors if watchlist changed

```typescript
// In main refresh handler, after Step 3:

const { watchlist } = JSON.parse(event.body || '{}')

if (watchlist && watchlist.length > 0) {
  const watchlistChange = await detectWatchlistChanges(scanId, watchlist)
  
  if (watchlistChange.changed) {
    console.log(`[REFRESH] Watchlist changed - re-fetching competitors`)
    
    // Call scan-step.mts stepCompetitors with new watchlist
    // This requires exposing stepCompetitors as a separate function
    // OR: Inline the competitor re-fetch logic here
    
    // For now: Log a TODO warning
    console.warn(`[REFRESH] TODO: Implement competitor re-fetch for watchlist changes`)
    console.log(`[REFRESH] Added: ${watchlistChange.added.join(', ')}`)
    console.log(`[REFRESH] Removed: ${watchlistChange.removed.join(', ')}`)
  }
}
```

### 4. Backend: Replace competitors logic

```typescript
async function replaceCompetitors(
  scanId: string,
  userId: string,
  industry: string,
  watchlist: string[],
  maxCompetitors: number
) {
  // 1. Fetch current competitors with threat_score
  const currentRes = await fetch(
    `${SUPABASE_URL}/rest/v1/competitors?scan_id=eq.${scanId}&select=*&order=threat_score.asc`,
    { headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const current = await currentRes.json()
  
  // 2. Separate watchlist vs auto-discovered
  const existingWatchlist = current.filter((c: any) => c.is_watchlist)
  const autoDiscovered = current.filter((c: any) => !c.is_watchlist)
  
  // 3. Normalize new watchlist
  const normalizedWatchlist = watchlist.map(w => w.toLowerCase().trim())
  const newWatchlistNames = normalizedWatchlist.filter(w => 
    !existingWatchlist.some((c: any) => c.name.toLowerCase() === w)
  )
  
  if (newWatchlistNames.length === 0) {
    console.log('[WATCHLIST] No new items to add')
    return
  }
  
  // 4. Calculate how many to remove (to stay under maxCompetitors)
  const totalAfterAdd = current.length + newWatchlistNames.length
  const toRemove = Math.max(0, totalAfterAdd - maxCompetitors)
  
  // 5. Remove lowest-score auto-discovered competitors
  const competitorsToRemove = autoDiscovered
    .sort((a, b) => a.threat_score - b.threat_score)  // Lowest first
    .slice(0, toRemove)
  
  console.log(`[WATCHLIST] Removing ${competitorsToRemove.length} low-score competitors:`, 
    competitorsToRemove.map(c => `${c.name} (${c.threat_score})`))
  
  // 6. Delete removed competitors
  if (competitorsToRemove.length > 0) {
    const idsToRemove = competitorsToRemove.map(c => c.id)
    await fetch(
      `${SUPABASE_URL}/rest/v1/competitors?id=in.(${idsToRemove.join(',')})`,
      {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      }
    )
  }
  
  // 7. Add new watchlist competitors (with placeholder data)
  const newCompetitors = newWatchlistNames.map(name => ({
    user_id: userId,
    scan_id: scanId,
    name: name,
    domain: null,
    industry: industry,
    threat_score: 7.0,  // Default medium-high threat
    activity_level: 'medium',
    description: 'User-added watchlist competitor',
    is_watchlist: true,
    last_activity_date: new Date().toISOString()
  }))
  
  await supabasePost('competitors', newCompetitors)
  
  console.log(`[WATCHLIST] Added ${newCompetitors.length} new watchlist competitors:`, 
    newCompetitors.map(c => c.name))
}
```

---

## 🧪 Testing Plan

### Test 1: Add to watchlist, then refresh
```
1. Existing scan with 5 competitors (all auto-discovered)
2. Settings → Watchlist: Add "Salesforce"
3. Profiles → Refresh
4. ✅ Salesforce should appear (replacing lowest-score competitor)
5. DB: SELECT * FROM competitors WHERE scan_id = '...' ORDER BY is_watchlist DESC, threat_score DESC
   → Should show Salesforce with is_watchlist=TRUE
```

### Test 2: Remove from watchlist, then refresh
```
1. Scan with watchlist competitor "HubSpot"
2. Settings → Watchlist: Remove "HubSpot"
3. Profiles → Refresh
4. ✅ HubSpot should be removed
5. ✅ Auto-discovered competitor should fill the gap (or not)
```

### Test 3: Watchlist unchanged
```
1. Scan with 3 watchlist items
2. Watchlist unchanged
3. Profiles → Refresh
4. ✅ Should NOT trigger competitor re-fetch
5. ✅ Logs: "[WATCHLIST] No changes detected"
```

---

## ⚠️ Risks

1. **Performance:** Re-fetching competitors on every refresh (mitigated by change detection)
2. **Data loss:** Removing auto-discovered competitors (mitigated by keeping high-score ones)
3. **API costs:** Extra Perplexity calls (minimal - only on watchlist change)

---

## 🚀 Deployment Strategy

### Phase 1: DONE ✅
- Watchlist UI in Settings
- is_watchlist column in DB
- Watchlist priority in NEW scans

### Phase 2: TODO 📋
- Change detection in refresh
- Competitor replacement logic
- Enhanced logging

### Phase 3: Future 🔮
- Bulk watchlist import (CSV)
- Watchlist competitor analytics
- Auto-suggest watchlist based on scan results

---

## 📝 Current Workaround (Until Phase 2)

**User flow:**
1. Add competitors to watchlist
2. Create a **NEW scan** (not Refresh)
3. Delete old scan if needed
4. ✅ New scan will include watchlist items

**Why this works:**
- NEW scans always apply current watchlist
- Refresh is ONLY for news/insights/alerts updates

---

**Next action:** Implement Phase 2 (estimated: 2-3 hours work)
