# WyzeLens Restore Points

## v1.5.3-limits-working (2026-03-07 23:30 EST) ⭐ CURRENT STABLE

**Commit:** `f5a0b3b`  
**Status:** ✅ STABLE - **DO NOT TOUCH REFRESH/LIMIT LOGIC**

### ⚠️ PROTECTED CODE - DO NOT MODIFY:
- `netlify/functions/scan-step.mts` lines 217-275 (refresh limit validation)
- `netlify/functions/run-scheduled-scans.mts` (auto-refresh cron logic)
- `src/pages/Dashboard.tsx` refresh button handler (lines ~625-710)
- `refresh_logs` table queries (always use `started_at`, not `created_at`)

### What Works Perfectly:
- ✅ **Manual refresh limits ENFORCED:** Free=1/day, Starter=3/day, Pro+=unlimited
- ✅ **Limit validation counts correctly** (fixed: uses `started_at` column)
- ✅ **Upgrade modal appears** when limit reached
- ✅ **Auto refresh** via cron (weekly/daily/hourly by plan)
- ✅ **NEW badges** on fresh items only
- ✅ **Activity tab** shows all logs with accurate counts
- ✅ **Delete profile** works (backend function)
- ✅ **No duplicate scans** on refresh
- ✅ **No duplicate alerts/insights** (title filtering)

### Critical Fix (v1.5.3):
- Query `refresh_logs` by `started_at` (not `created_at` which doesn't exist)
- This fixed the "0/1 used today" bug that let users bypass limits

### Architecture:
1. **Refresh flow:** `init` (validate limits) → `news` → `analyze` (create log)
2. **Limit check:** Query `refresh_logs` with `started_at >= midnight UTC`
3. **3 distinct limits:**
   - Active profiles: Free=1, Starter=3, Pro=5, Business=10
   - Manual refresh daily: Free=1/day, Starter=3/day, Pro+=unlimited
   - Auto refresh freq: Free=weekly, Starter=daily, Pro+=hourly

### Restore Command:
```bash
git checkout v1.5.3-limits-working
```

---

## v1.5.2-refresh-stable (2026-03-07 16:40 EST)

**Commit:** `69532b2`  
**Status:** ✅ Stable - Production Ready

### What Works:
- ✅ Manual refresh with daily limits (Free=1/day, Starter=3/day, Pro+=unlimited)
- ✅ Auto refresh via GitHub Actions cron (weekly/daily/hourly based on plan)
- ✅ NEW badges on fresh items only (is_new flag reset + set correctly)
- ✅ Activity tab shows all refresh logs (manual + scheduled) with accurate counts
- ✅ Duplicate alert/insight filtering (no unique constraint violations)
- ✅ Upgrade modal on limit reached
- ✅ Query includes 'running' scans to prevent duplicate scan creation

### Key Features:
1. **3 Distinct Limits:**
   - Active profiles: Free=1, Starter=3, Pro=5, Business=10
   - Manual refresh daily count: Free=1/day, Starter=3/day, Pro+=unlimited
   - Auto refresh frequency: Free=weekly, Starter=daily, Pro+=hourly

2. **Refresh Flow:**
   - `init` → validates limits, resets is_new flags
   - `news` → fetches latest news
   - `analyze` → generates insights/alerts, filters duplicates, creates refresh_log

3. **Badge Logic:**
   - Before refresh: reset all is_new=false
   - New items: inserted with is_new=true
   - Frontend displays NEW badge only on is_new=true items

### Known Issues:
- ⚠️ Some scans stay in status='running' after completion (has completed_at but status not updated)
- Workaround: Query includes 'running' status to reuse these scans

### Restore Command:
```bash
git checkout v1.5.2-refresh-stable
```

---

## v1.5.1-activity-log-stable (2026-03-06 21:58 EST)

**Commit:** `364449c`  
**Status:** ✅ Stable - Previous production version

### What Worked:
- Manual refresh via old flow (analyze-insights → analyze-alerts → finalize)
- Activity log tracking
- NEW badges

### Why Upgraded:
- Simplified to 3-step flow (init → news → analyze)
- Better duplicate handling
- Clearer limit enforcement

---

## Rollback Instructions

### To v1.5.2-refresh-stable (current stable):
```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git checkout v1.5.2-refresh-stable
npm install
git push origin main --force  # If needed
```

### To v1.5.1-activity-log-stable (previous stable):
```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git checkout v1.5.1-activity-log-stable
npm install
git push origin main --force  # If needed
```

### Verify Deployment:
1. Check Netlify build logs
2. Test manual refresh
3. Check Activity tab for logs
4. Verify NEW badges appear correctly

---

**Last Updated:** 2026-03-07 16:40 EST
