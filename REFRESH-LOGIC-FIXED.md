# Refresh Logic - Final Implementation (2026-03-07)

## ✅ What Was Fixed

### 1. **Backend: `scan-step.mts` (`stepInit`)**

**Before:**
- ❌ Two conflicting limit checks (daily count + hourly cooldown)
- ❌ No `refresh_log` creation for manual refreshes
- ❌ No `is_new` flag reset (old items kept NEW badge)

**After:**
```typescript
// ✅ ONLY daily count limit for manual refreshes
// Free: 1/day, Starter: 3/day, Pro+: unlimited

// ✅ Create refresh_log (triggered_by='manual')
if (!isScheduled) {
  await supabasePost('refresh_logs', {
    scan_id: existingScan.id,
    user_id: actualUserId,
    industry,
    status: 'running',
    triggered_by: 'manual',
    started_at: new Date().toISOString()
  })
}

// ✅ Reset is_new flags BEFORE refresh
await supabasePatch('news_feed', `scan_id=eq.${scanId}`, { is_new: false })
await supabasePatch('insights', `scan_id=eq.${scanId}`, { is_new: false })
await supabasePatch('alerts', `scan_id=eq.${scanId}`, { is_new: false })
```

---

### 2. **Frontend: `Dashboard.tsx` (Refresh Button)**

**Before:**
- ❌ Called `init` without `isRefresh` flag
- ❌ Used old split steps (`analyze-insights`, `analyze-alerts`, `finalize`)
- ❌ No `refresh_log` update on completion
- ❌ Brutal `window.location.reload()`

**After:**
```typescript
// Step 1: Init (validates limits, resets flags, creates log)
await callStep('init', {
  industry: selectedScan.industry,
  companyUrl: selectedScan.company_url,
  companyName: selectedScan.company_name,
  userId: user?.id,
  isRefresh: true,      // ← EXPLICIT
  isScheduled: false    // ← EXPLICIT: manual refresh
})

// Step 2: News
const newsResult = await callStep('news', {
  scanId,
  industry: selectedScan.industry,
  userId: user?.id
})

// Step 3: Analyze (insights + alerts)
const analyzeResult = await callStep('analyze', {
  scanId,
  industry: selectedScan.industry,
  news: newsResult.news || [],
  userId: user?.id,
  isRefresh: true
})

// Mark scan completed
await supabase
  .from('scans')
  .update({ status: 'completed', updated_at: new Date().toISOString() })
  .eq('id', scanId)

// Update refresh_log to completed
const { data: logs } = await supabase
  .from('refresh_logs')
  .select('id')
  .eq('scan_id', scanId)
  .eq('status', 'running')
  .order('started_at', { ascending: false })
  .limit(1)

if (logs && logs.length > 0) {
  await supabase
    .from('refresh_logs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      new_news_count: newsResult.count || 0,
      new_insights_count: analyzeResult.insights || 0,
      new_alerts_count: analyzeResult.alerts || 0
    })
    .eq('id', logs[0].id)
}
```

---

## 🎯 3 Distinct Limits (Clarified)

### 1. **Active Profiles (New Scans)**
- Free: 1 profile
- Starter: 3 profiles
- Pro: 5 profiles
- Business: 10 profiles
- Enterprise: unlimited

**Check location:** `stepInit` (NEW SCAN MODE)  
**Error message:** "Plan limit reached. You have X active profiles. Your [plan] plan allows Y."

---

### 2. **Manual Refresh (Daily Count)**
- Free: 1 manual refresh per day (UTC)
- Starter: 3 manual refreshes per day (UTC)
- Pro/Business/Enterprise: unlimited manual refreshes

**Check location:** `stepInit` (REFRESH MODE, `!isScheduled`)  
**Error message:** "Daily refresh limit reached. Your [plan] plan allows X manual refreshes per day."

---

### 3. **Auto Refresh (Frequency)**
- Free: Weekly (Sunday midnight UTC)
- Starter: Daily (midnight UTC)
- Pro/Business/Enterprise: Hourly

**Check location:** `run-scheduled-scans.mts` (cron logic)  
**No user-facing error** (system determines schedule based on plan)

---

## 🏷️ NEW Badge Logic

### How it works:

1. **Before refresh:** `stepInit` resets ALL `is_new=false` for existing items
2. **During refresh:** Backend inserts new items with `is_new=true`
3. **Frontend displays:** Items with `is_new=true` show NEW badge

### Database columns:
```sql
-- news_feed
is_new BOOLEAN DEFAULT true

-- insights
is_new BOOLEAN DEFAULT true

-- alerts
is_new BOOLEAN DEFAULT true
```

### Frontend rendering:
```tsx
{item.is_new && (
  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
    NEW
  </span>
)}
```

---

## 📊 Activity Tab (Refresh Logs)

**Table:** `refresh_logs`

**Columns:**
- `id` (serial)
- `scan_id` (uuid)
- `user_id` (text)
- `industry` (text)
- `triggered_by` ('manual' | 'scheduled')
- `status` ('running' | 'completed' | 'failed')
- `started_at` (timestamptz)
- `completed_at` (timestamptz, nullable)
- `new_alerts_count` (int, default 0)
- `new_insights_count` (int, default 0)
- `new_news_count` (int, default 0)
- `error_message` (text, nullable)
- `created_at` (timestamptz, default now())

**Display:**
- Shows all refreshes (manual + scheduled)
- Counts visible even when 0 (e.g., "0 alerts · 0 insights · 3 news")
- Status badge (completed = green, running = yellow, failed = red)

---

## 🧪 Testing Checklist

### Manual Refresh (Free Plan):
1. ✅ First refresh of the day → succeeds
2. ✅ Second refresh attempt → shows "Daily refresh limit reached" + upgrade modal
3. ✅ Activity tab shows 1 completed manual refresh
4. ✅ NEW badge appears on fresh items only

### Manual Refresh (Pro Plan):
1. ✅ Multiple refreshes per day → all succeed
2. ✅ Activity tab shows all manual refreshes
3. ✅ NEW badge resets correctly on each refresh

### Auto Refresh (Cron):
1. ✅ Free plan: Runs weekly (Sunday midnight UTC)
2. ✅ Starter plan: Runs daily (midnight UTC)
3. ✅ Pro+ plan: Runs hourly
4. ✅ Activity tab shows `triggered_by='scheduled'`

---

## 🚀 Deployment

**Commit:** `ffd0ccd`  
**Date:** 2026-03-07 15:00 EST  
**Status:** ✅ Deployed to production

**Files changed:**
- `netlify/functions/scan-step.mts` (stepInit logic)
- `src/pages/Dashboard.tsx` (refresh button handler)

---

## 📝 Summary

**What the user clicks Refresh:**
1. Backend validates manual refresh limit (daily count)
2. Backend resets `is_new=false` for all existing items
3. Backend creates `refresh_log` (triggered_by='manual', status='running')
4. Backend fetches news → generates insights/alerts → marks new items `is_new=true`
5. Backend updates `refresh_log` (status='completed', counts populated)
6. Frontend refetches data → NEW badges appear on fresh items only
7. Activity tab shows the refresh log with accurate counts

**3 Limits Enforced:**
- ✅ Active profiles (Free=1, Starter=3, Pro=5, Business=10)
- ✅ Manual refresh daily count (Free=1/day, Starter=3/day, Pro+=unlimited)
- ✅ Auto refresh frequency (Free=weekly, Starter=daily, Pro+=hourly)

**All logs visible in Activity tab** (manual + scheduled, even when counts are 0).
