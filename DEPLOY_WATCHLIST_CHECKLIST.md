# 🚀 Watchlist Priority Feature - Deploy Checklist

**Deploy Date:** 2026-03-11  
**Version:** v1.6.0-watchlist  
**Restore Point:** v1.6.0-pre-watchlist (commit 3b9e893)

---

## ✅ Pre-Deploy (DONE)

- [x] Feature branch created: `feature/watchlist-priority`
- [x] Build passes locally: `npm run build` ✓
- [x] Restore point tagged: `v1.6.0-pre-watchlist`
- [x] Merged to main: commit `4ea737b`
- [x] Pushed to GitHub: Netlify auto-deploy triggered

---

## ⚠️ CRITICAL: Apply Database Migration NOW

**BEFORE testing the deployed app, run this SQL:**

```sql
-- Go to: https://supabase.com/dashboard/project/erkzlqgpbrxokyqtrgnf
-- SQL Editor → New Query → Paste below → Run

-- Add is_watchlist column to competitors table
ALTER TABLE competitors 
ADD COLUMN IF NOT EXISTS is_watchlist BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_competitors_watchlist 
ON competitors(scan_id, is_watchlist);

-- Add comment
COMMENT ON COLUMN competitors.is_watchlist IS 
'TRUE if competitor was manually added via user watchlist, FALSE if auto-discovered by AI';

-- Verify migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'competitors' AND column_name = 'is_watchlist';
```

**Expected result:**
```
column_name  | data_type | is_nullable | column_default
is_watchlist | boolean   | YES         | false
```

**Status:** [ ] Migration applied (check this box after running)

---

## 🧪 Post-Deploy Testing (Production)

### Test 1: Watchlist Empty (Baseline)
```
[ ] Login to https://wyzelens.com
[ ] Settings → Watchlist = empty
[ ] New Scan → Industry: Technology
[ ] ✓ Scan completes successfully
[ ] ✓ Competitors displayed (auto-discovered only)
[ ] DB check: No rows with is_watchlist=TRUE for this scan
```

### Test 2: Add 3 Watchlist Items
```
[ ] Settings → Watchlist
[ ] Add: "Salesforce", "HubSpot", "Pipedrive"
[ ] Counter shows: 3/10 (or 3/5 for Free)
[ ] New Scan → Industry: CRM
[ ] ✓ Scan completes
[ ] ✓ All 3 watchlist items appear in results
[ ] DB check: 3 competitors have is_watchlist=TRUE
```

SQL verification:
```sql
SELECT scan_id, name, is_watchlist, description
FROM competitors
WHERE scan_id = (SELECT id FROM scans ORDER BY created_at DESC LIMIT 1)
ORDER BY is_watchlist DESC, name;
```

### Test 3: Plan Limit Enforcement
```
[ ] Settings → Watchlist
[ ] Try adding more items than plan allows
[ ] ✓ Alert displayed: "Your [plan] allows up to X competitors"
[ ] ✓ Cannot exceed limit
```

### Test 4: Duplicate Detection
```
[ ] Watchlist has "Salesforce"
[ ] Try adding "salesforce" (lowercase)
[ ] ✓ Alert: "This competitor is already in your watchlist"
```

### Test 5: Refresh Existing Scan
```
[ ] Existing scan with competitors
[ ] Click "Refresh"
[ ] ✓ Refresh completes
[ ] ✓ Only news/insights/alerts updated
[ ] ✓ Competitors list unchanged
```

---

## 📊 Monitoring (First 24 Hours)

### Netlify Deploy Logs
```
[ ] Build passed: https://app.netlify.com/sites/wyzelens/deploys
[ ] No TypeScript errors
[ ] No runtime errors in Functions
```

### Supabase Logs
```sql
-- Check watchlist adoption (run every 6h)
SELECT 
  COUNT(DISTINCT user_id) as users_with_watchlist,
  COUNT(*) as total_watchlist_items
FROM competitors 
WHERE is_watchlist = TRUE;

-- Check scan success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM scans
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Check for errors in recent scans
SELECT id, industry, status, error_message, created_at
FROM scans
WHERE status = 'failed' 
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### User Feedback
```
[ ] Check for error reports in support email
[ ] Monitor Discord/Slack for complaints
[ ] Watch for failed scan alerts
```

---

## 🚨 Rollback Plan (If Issues Detected)

### Option A: Git Revert (Recommended)
```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git revert -m 1 4ea737b  # Revert the merge commit
git push origin main
# Netlify will auto-deploy the reverted version
```

### Option B: Reset to Restore Point
```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git reset --hard v1.6.0-pre-watchlist
git push origin main --force
# ⚠️ Use with caution - rewrites history
```

### Option C: Netlify UI Rollback
```
1. Go to: https://app.netlify.com/sites/wyzelens/deploys
2. Find deploy BEFORE merge (commit 3b9e893)
3. Click "Publish deploy"
4. Instant rollback (no git changes needed)
```

### Database Rollback (If Needed)
```sql
-- Remove is_watchlist column (safe - backward compatible)
ALTER TABLE competitors DROP COLUMN IF EXISTS is_watchlist;

-- Remove index
DROP INDEX IF EXISTS idx_competitors_watchlist;
```

**Note:** Old version works WITHOUT migration (column optional)

---

## ✅ Success Criteria (After 24h)

```
[ ] Scan success rate > 95%
[ ] No increase in error rate
[ ] At least 1 user adopted watchlist feature
[ ] No support complaints
[ ] Database queries performant (<100ms)
```

---

## 📝 Post-Deploy Notes

**Observations:**
```
- Deployment time: ___:___ EDT
- First test scan: [ ] Pass [ ] Fail
- Migration applied: [ ] Yes [ ] No
- Issues detected: ________________________
- Rollback needed: [ ] Yes [ ] No
```

**Next Steps (After Validation):**
```
[ ] Update MEMORY.md with feature launch
[ ] Create v1.6.0-watchlist tag (stable)
[ ] Delete feature branch: git branch -d feature/watchlist-priority
[ ] Announce feature to users (if successful)
```

---

## 🔗 Quick Links

- **Netlify Dashboard:** https://app.netlify.com/sites/wyzelens/deploys
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/erkzlqgpbrxokyqtrgnf/sql
- **GitHub Commit:** https://github.com/deedeetype/wyzelens-react/commit/4ea737b
- **Restore Point Tag:** https://github.com/deedeetype/wyzelens-react/releases/tag/v1.6.0-pre-watchlist

---

**Status:** 🚀 DEPLOYED - Monitoring in progress
