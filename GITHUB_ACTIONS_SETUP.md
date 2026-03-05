# GitHub Actions - Automated Scans Setup

## 🎯 Purpose
The GitHub Actions workflow runs every hour to check for scheduled scans and trigger them automatically.

---

## 📋 Required Setup

### 1. GitHub Repository Secret
**You need to add this secret in your GitHub repository:**

**Location:** GitHub repo → Settings → Secrets and variables → Actions → New repository secret

```
Name: CRON_SECRET
Value: (generate a secure random string, e.g., a UUID or 32+ character random string)
```

**To generate a secure secret:**
```bash
# Option 1: Using openssl
openssl rand -hex 32

# Option 2: Using uuidgen
uuidgen

# Option 3: Online generator
# Visit: https://www.uuidgenerator.net/
```

---

### 2. Netlify Environment Variable
**You need to add the SAME secret in Netlify:**

**Location:** Netlify Dashboard → Site settings → Environment variables → Add variable

```
Key: CRON_SECRET
Value: (the same value you used in GitHub)
Scopes: Production, Deploy previews (both checked)
```

**This allows the Netlify function to verify the request came from your GitHub Actions.**

---

## 🔧 Current Configuration

### GitHub Actions Workflow
**File:** `.github/workflows/automated-scans.yml`

**Schedule:** Runs every hour (`0 * * * *`)

**Endpoint:** `https://wyzelens.com/.netlify/functions/run-scheduled-scans`

**What it does:**
1. Runs every hour
2. Calls the Netlify function with authorization
3. Function checks Supabase for due scans
4. Executes any scans that are scheduled to run

### Netlify Function
**File:** `netlify/functions/run-scheduled-scans.mts`

**What it does:**
1. Verifies `CRON_SECRET` authorization
2. Queries `scan_schedules` table for enabled schedules
3. Checks if any schedules are due (based on time, day, frequency)
4. Calls `scan-step` function to execute the scan
5. Updates `last_run_at` and `next_run_at` timestamps

**Environment variables needed:**
- `CRON_SECRET` - For authorization
- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Testing the Setup

### Manual Test via GitHub
1. Go to GitHub repo → Actions tab
2. Click "Automated Scans Runner" workflow
3. Click "Run workflow" (workflow_dispatch trigger)
4. Check the logs to see if it runs successfully

### Manual Test via curl
```bash
curl -X POST https://wyzelens.com/.netlify/functions/run-scheduled-scans \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source": "manual-test", "timestamp": "2026-03-05T21:00:00Z"}'
```

Expected response if working:
```json
{
  "success": true,
  "scansExecuted": 0,
  "timestamp": "..."
}
```

---

## 🐛 Troubleshooting

### "Unauthorized" error
- ❌ `CRON_SECRET` not set in GitHub Secrets
- ❌ `CRON_SECRET` not set in Netlify env vars
- ❌ Values don't match between GitHub and Netlify

### "Function not found" error
- ❌ Wrong URL (should be `wyzelens.com` not `wyzelensreact.netlify.app`)
- ❌ Function not deployed

### Scans not executing
- ❌ `scan_schedules.enabled` is `false`
- ❌ `next_run_at` is in the future
- ❌ Time calculation logic issue (check timezone)

### Check Netlify Function Logs
1. Netlify Dashboard → Functions
2. Click `run-scheduled-scans`
3. View recent invocations
4. Check for errors or authorization issues

---

## 📊 Current Schedules

From your data, you have 2 active schedules:

**Schedule 1:**
- User: `user_3AXSMEiuVD8uBVidyEA6Yb7MlIA`
- Scan: `ad1c186b-c0c1-4ab5-8a65-aa96b858a31b`
- Frequency: Weekly (Thursday)
- Time: 16:00 (4 PM EST)
- Next run: 2026-03-05 21:00:00 UTC (4 PM EST)
- Status: Enabled ✅

**Schedule 2:**
- User: `user_3AXUBCzlEdDb0TWghVDckX1LnxT`
- Scan: `e4736ec4-47ad-4d48-836b-ddad4f4a6026`
- Frequency: Daily
- Time: 16:00 (4 PM EST)
- Next run: 2026-03-05 21:00:00 UTC (4 PM EST)
- Status: Enabled ✅

**Both should trigger at 9 PM UTC (4 PM EST) today!**

---

## ✅ Setup Checklist

- [ ] Generate `CRON_SECRET` (random secure string)
- [ ] Add `CRON_SECRET` to GitHub repo secrets
- [ ] Add `CRON_SECRET` to Netlify env vars
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` exists in Netlify
- [ ] Test workflow manually in GitHub Actions
- [ ] Check Netlify function logs for any errors
- [ ] Wait for next scheduled time (4 PM EST / 9 PM UTC)
- [ ] Verify scan executes and `last_run_at` updates in Supabase

---

## 🦝 Quick Fix

If you want to test RIGHT NOW:

1. **Generate secret:**
   ```bash
   echo $(uuidgen)
   ```

2. **Add to GitHub:** Settings → Secrets → Actions → New secret
   - Name: `CRON_SECRET`
   - Value: (paste the UUID)

3. **Add to Netlify:** Site settings → Env vars → Add
   - Key: `CRON_SECRET`
   - Value: (same UUID)
   - Scopes: Production ✅

4. **Trigger manually:** GitHub → Actions → Run workflow

5. **Check logs:** Netlify Functions → run-scheduled-scans

---

**Do you want me to help verify what's currently configured?**
