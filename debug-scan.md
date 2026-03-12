# Debug: New Scan Returns 0 Competitors

## Issue
New scan for "Automotive" industry with watchlist ["Tesla"] returned 0 competitors.

## Logs Analysis

```
[ANALYZE-COMPETITORS] Analyzed 0 competitors
[FINALIZE] Data: 0 competitors, 4 insights, 5 alerts, 10 news
[FINALIZE] Inserted 0 competitors (0 from watchlist)
```

## Possible Causes

### 1. stepCompetitors() Not Called
- Frontend skipped step 1 (competitor discovery)
- Only called step 2 (news), step 3a-c (analyze), step 3d (finalize)

### 2. stepCompetitors() Returned Empty Array
- Perplexity API error (no response)
- JSON parse error (malformed response)
- Filter removed all competitors

### 3. Watchlist Matching Failed
- watchlistStr in prompt but Perplexity ignored
- Post-processing filtered out all results

## Debug Steps

### Check Frontend Call
```javascript
// In Dashboard.tsx startScan()
console.log('[SCAN] Calling stepCompetitors with:', {
  industry,
  watchlist: settings.scanPreferences.watchlist,
  maxCompetitors: settings.scanPreferences.maxCompetitors
})

const compResult = await callStep('competitors', {
  industry,
  scanId,
  companyUrl,
  maxCompetitors: settings.scanPreferences.maxCompetitors,
  regions: settings.scanPreferences.targetRegions,
  watchlist: settings.scanPreferences.watchlist
})

console.log('[SCAN] stepCompetitors returned:', compResult)
```

### Check Backend Logs
```
[COMPETITORS] Enforcing watchlist priority (1 items)
[COMPETITORS] Found X/1 watchlist items in results
[COMPETITORS] Final count: X (Y watchlist + Z auto)
```

If these logs are MISSING → stepCompetitors not called

### Check Perplexity Response
```
Poe response status: 200 has choices: true
[COMPETITORS] Only received X/Y competitors
```

## Next Actions

1. Check if step='competitors' was called in frontend
2. Check Perplexity API response (raw JSON)
3. Add more logging in parseJsonArray()
4. Verify watchlist format sent to backend

## Workaround

User should:
1. Delete failed scan (0 competitors)
2. Clear watchlist temporarily
3. Create scan without watchlist (baseline test)
4. If works → Add watchlist back
5. If still fails → Perplexity API issue
