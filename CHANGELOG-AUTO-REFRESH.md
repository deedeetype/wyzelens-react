# Auto-Refresh Simplification - 2026-03-07

## 🎯 Changes Summary

Simplified automated refresh system from user-configured schedules to plan-based automatic schedules.

---

## 🔄 New Auto-Refresh Logic

### Plan-Based Schedule (Fixed, Non-Configurable)

| Plan       | Refresh Frequency    | Window                  |
|------------|---------------------|-------------------------|
| **Free**   | Weekly              | Sunday midnight UTC     |
| **Starter**| Daily               | Every day midnight UTC  |
| **Pro**    | Hourly              | Top of every hour       |
| **Business**| Hourly             | Top of every hour       |
| **Enterprise**| Hourly           | Top of every hour       |

### Implementation Details

**GitHub Actions Cron:**
- Runs every hour: `'0 * * * *'`
- Calls `/.netlify/functions/run-scheduled-scans`

**Backend Logic (`run-scheduled-scans.mts`):**
1. Fetch all completed scans with user subscription data
2. For each scan, check:
   - **Free plan**: `last_refreshed_at > 6.5 days` AND `Sunday midnight UTC` → refresh
   - **Starter plan**: `last_refreshed_at > 23 hours` AND `midnight UTC` → refresh
   - **Pro/Business/Enterprise**: `last_refreshed_at > 0.98 hours` → refresh
3. Execute refresh (news + analyze steps only)
4. Log to `refresh_logs` with `triggered_by='scheduled'`

---

## 🗑️ Removed

### Database (NOT DROPPED - kept for rollback)
- `scan_schedules` table (still exists but unused)

### Frontend
- `AutomatedScansSettings.tsx` component (removed from imports)
- "Automated Scans" tab in Settings (removed)
- User-configured frequency/hour/day_of_week UI

### Replaced With
- **Simple info card** in Settings showing current plan's refresh schedule
- Text: "Your scans auto-refresh [weekly/daily/hourly] based on your [plan] plan"

---

## ✅ Preserved Features

### Activity Tab
- **NO CHANGES** — `refresh_logs` table unchanged
- Shows all refreshes (manual + scheduled)
- Counts (new items), timestamps, triggered_by

### Manual Refresh
- **NO CHANGES** — Still works as before
- Daily limits enforced (Free=1, Starter=3, Pro+=unlimited)
- Logged to `refresh_logs` with `triggered_by='manual'`

---

## 🧪 Testing

To test scheduled refresh logic manually:

```bash
# Trigger workflow dispatch
curl -X POST https://wyzelens.com/.netlify/functions/run-scheduled-scans \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source": "manual-test"}'
```

Check Netlify function logs for:
- `[Cron] Plan-based auto-refresh check...`
- `[Cron] Scan [id] (free/starter/pro) is due: [reason]`
- Refresh completion/failure

---

## 📊 Benefits

✅ **Simpler UX**: No configuration needed  
✅ **Clearer value prop**: "Pro = hourly, Starter = daily, Free = weekly"  
✅ **Less code**: ~170 lines removed  
✅ **More reliable**: No user misconfiguration  
✅ **Easier to maintain**: One source of truth (plan → schedule)

---

## 🔙 Rollback Plan

If needed, revert to commit `2ae4228` (before this change):

```bash
git revert 7d9e916
git push
```

Table `scan_schedules` is still intact in Supabase (not dropped).

---

**Deployed:** 2026-03-07 11:20 EST  
**Commit:** `7d9e916`  
**Status:** ✅ Production
