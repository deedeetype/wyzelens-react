# Watchlist Priority Feature - Implementation Notes

**Branch:** `feature/watchlist-priority`  
**Date:** 2026-03-11  
**Status:** ⚠️ TESTING REQUIRED BEFORE MERGE

---

## 🎯 Feature Summary

Users can now add competitors to their watchlist (Pro+ plans), which are **always included** in scans with **top priority**.

### Key Behaviors:
1. **Watchlist items = Priority #1** - Always included in scan results
2. **Auto-discovered fills remaining slots** - Up to `maxCompetitors` limit
3. **Plan limits enforced** - Free: 5, Starter: 10, Pro: 15, Business: unlimited
4. **Watchlist marked in DB** - New column: `competitors.is_watchlist`

---

## 📝 Changes Made

### **1. Database Schema**
- **File:** `supabase/migrations/add_watchlist_flag.sql`
- **Change:** Added `is_watchlist BOOLEAN DEFAULT FALSE` to `competitors` table
- **Index:** `idx_competitors_watchlist` for faster queries

### **2. Backend (scan-step.mts)**

#### `stepCompetitors()`:
- Enhanced prompt to emphasize watchlist items (🎯 CRITICAL REQUIREMENT)
- Added post-processing to **guarantee** watchlist inclusion
- Missing watchlist items are added manually with placeholder data
- Returns `{ companies, count, watchlistCount }`

#### `stepFinalize()`:
- Marks competitors with `is_watchlist: true` when inserting to DB
- Detection based on: `position === 'Watchlist Item'` or description

### **3. Frontend (SettingsView.tsx)**

#### Watchlist Management:
- ✅ Added plan limit validation (`limits.competitors`)
- ✅ Show count: `3/10` next to label
- ✅ Duplicate detection (case-insensitive)
- ✅ Alert when limit reached
- ✅ Updated description: "(top priority)"

---

## 🧪 Testing Required

### **Manual Tests (Before Merge):**

```bash
# Test 1: Empty watchlist (baseline - should work as before)
1. Settings → Watchlist = empty
2. Create new scan
3. ✅ Should return auto-discovered competitors only

# Test 2: Watchlist with 3 items (Starter plan, max 10)
1. Settings → Add "Salesforce", "HubSpot", "Pipedrive"
2. Create CRM scan
3. ✅ Should return: 3 watchlist + 7 auto = 10 total
4. ✅ Check DB: 3 competitors have is_watchlist=true

# Test 3: Watchlist > maxCompetitors (edge case)
1. Free plan: max 5 competitors
2. Add 8 items to watchlist
3. ✅ UI should block after 5 ("Plan limit reached")

# Test 4: Perplexity misses watchlist item
1. Add "ZohoDesk" to watchlist (obscure name)
2. Create scan
3. ✅ Should still appear in results (manual add fallback)

# Test 5: Refresh without watchlist change
1. Existing scan with watchlist
2. Refresh profile
3. ✅ Should NOT re-fetch competitors (only news/insights)

# Test 6: Duplicate watchlist (case sensitivity)
1. Try adding "salesforce" when "Salesforce" exists
2. ✅ Should show "already in watchlist" alert
```

---

## ⚠️ Potential Risks

### **High Risk:**
1. **Perplexity ignores watchlist** → Mitigated by post-processing fallback
2. **Refresh breaks existing scans** → Tested with `isRefresh` flag

### **Medium Risk:**
3. **Plan limits bypassed via API** → UI validation only (backend trusts frontend)
4. **Watchlist name matching fails** → Using fuzzy matching (includes/toLowerCase)

### **Low Risk:**
5. **Database migration fails** → SQL uses `IF NOT EXISTS` (safe)

---

## 🔄 Refresh Logic (Not Yet Implemented)

**TODO for v2:**
- Detect watchlist changes on refresh
- Replace lowest-score auto-discovered with new watchlist items
- Currently: Refresh does NOT modify competitors (only news/insights)

**Deferred reason:** Complex replacement logic, need more testing

---

## 🚀 Deployment Plan

### **Phase 1: Testing (Current)**
```bash
# On feature branch
git checkout feature/watchlist-priority
npm run build  # ✅ Passes
# Manual tests (5-6 scenarios above)
```

### **Phase 2: Staging Deploy**
```bash
# If tests pass
git push origin feature/watchlist-priority
# Deploy to staging environment (if available)
# Smoke test with real data
```

### **Phase 3: Production Merge**
```bash
# If staging looks good
git checkout main
git merge feature/watchlist-priority --no-ff
git push origin main
# Monitor Netlify deploy
# Watch for errors in logs
```

### **Phase 4: Rollback Plan**
```bash
# If issues in production
git revert <merge-commit-hash>
git push origin main
# OR: Redeploy previous main commit via Netlify UI
```

---

## 📊 Monitoring After Deploy

### **Key Metrics:**
1. **Scan success rate** - Should remain >95%
2. **Watchlist adoption** - How many users add items?
3. **Competitor count accuracy** - Are watchlist items always included?
4. **Error logs** - Watch for "missing watchlist" warnings

### **Database Queries (Post-Deploy):**
```sql
-- Count watchlist competitors
SELECT COUNT(*) FROM competitors WHERE is_watchlist = TRUE;

-- Users with watchlist
SELECT user_id, COUNT(*) as watchlist_count 
FROM competitors 
WHERE is_watchlist = TRUE 
GROUP BY user_id;

-- Scans with mixed watchlist + auto
SELECT scan_id, 
       SUM(CASE WHEN is_watchlist THEN 1 ELSE 0 END) as watchlist,
       SUM(CASE WHEN NOT is_watchlist THEN 1 ELSE 0 END) as auto
FROM competitors 
GROUP BY scan_id;
```

---

## 🐛 Known Issues / Limitations

1. **Refresh doesn't update competitors** - Watchlist changes only apply to NEW scans
2. **No domain validation** - Users can add invalid company names
3. **No auto-complete** - Users must type exact names
4. **Backend trusts frontend limits** - No server-side plan validation

---

## 📅 Next Steps

- [ ] Run manual tests (6 scenarios)
- [ ] Apply DB migration on Supabase
- [ ] Test on staging (if available)
- [ ] Merge to main if all tests pass
- [ ] Monitor production for 24h
- [ ] Document in user-facing changelog

---

**IMPORTANT:** Do NOT merge until manual tests pass! 🛑
