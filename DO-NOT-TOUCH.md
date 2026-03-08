# ⚠️ PROTECTED CODE - DO NOT MODIFY

**Last stable version:** v1.5.3-limits-working (2026-03-07 23:30 EST)

---

## 🔒 Files/Sections to NEVER Touch Without Explicit Permission:

### 1. **Refresh Limit Validation**
**File:** `netlify/functions/scan-step.mts`  
**Lines:** 217-275  
**Function:** `stepInit` - manual refresh daily limit check

```typescript
// This block validates Free=1/day, Starter=3/day, Pro+=unlimited
// Queries refresh_logs by started_at (NOT created_at which doesn't exist)
// DO NOT change the query or the limit logic
```

**Why protected:** Took multiple iterations to get the limit validation working correctly. Any change breaks the counting logic.

---

### 2. **Auto-Refresh Cron Logic**
**File:** `netlify/functions/run-scheduled-scans.mts`  
**Lines:** All

**Why protected:** Plan-based frequency logic (weekly/daily/hourly) is stable. Touches this = breaks automated refreshes.

---

### 3. **Refresh Button Handler**
**File:** `src/pages/Dashboard.tsx`  
**Lines:** ~625-710 (refresh button onClick)

**Flow:**
```typescript
onClick={async () => {
  // Step 1: Init (validates limits, resets is_new)
  await callStep('init', { isRefresh: true, isScheduled: false })
  
  // Step 2: News
  await callStep('news', { scanId, industry, userId })
  
  // Step 3: Analyze (creates refresh_log)
  await callStep('analyze', { scanId, industry, news, isRefresh: true })
}}
```

**Why protected:** 3-step sequence is delicate. Missing `isRefresh: true` or `isScheduled: false` = breaks limit validation.

---

### 4. **Critical Query Pattern**
**Pattern:** Always use `started_at` when querying `refresh_logs` for date filtering

**CORRECT:**
```typescript
refresh_logs?started_at=gte.${startOfDayUTC.toISOString()}
```

**WRONG (will break):**
```typescript
refresh_logs?created_at=gte.${startOfDayUTC.toISOString()}
// ❌ created_at column doesn't exist in refresh_logs table
```

**Table schema:**
- ✅ Has: `started_at`, `completed_at`
- ❌ Does NOT have: `created_at`

---

### 5. **Environment Variable Pattern**
**All Netlify functions must use:**
```typescript
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
// ☝️ Order matters! SUPABASE_SERVICE_KEY first
```

---

## 🚨 If You Must Change Protected Code:

1. **Create a NEW branch** (don't touch main)
2. **Test thoroughly** on the branch
3. **Verify in Netlify logs:**
   - Manual refresh limits enforced (see `[stepInit] Manual refresh allowed: X/Y used today`)
   - Upgrade modal appears on 2nd refresh (Free plan)
   - Activity tab shows correct counts
4. **Ask David for approval** before merging to main
5. **Create a new restore point** after confirming it works

---

## 📊 How to Verify Limits Work:

### Test Manual Refresh Limits (Free Plan):
1. Clear today's refresh_logs for your user (in Supabase)
2. Click Refresh → Should succeed (0/1 → 1/1)
3. Click Refresh again → Should fail with "Daily refresh limit reached"
4. Check Netlify logs for:
   ```
   [stepInit] Manual refresh allowed: 0/1 used today  (1st attempt)
   [stepInit] Daily manual refresh limit reached: 1/1  (2nd attempt)
   ```

### Test Auto Refresh:
1. Check GitHub Actions runs every hour (top of the hour)
2. Verify Netlify function logs show plan-based filtering
3. Confirm Activity tab shows `triggered_by='scheduled'`

---

## 🔙 Emergency Rollback:

```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git checkout v1.5.3-limits-working
git push origin main --force
```

Wait for Netlify auto-deploy (~2 minutes).

---

**Remember:** If it works, don't touch it. 🦝
