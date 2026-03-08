# 🔍 Proposed Change: Industry Cooldown Protection

**Date:** 2026-03-07 23:44 EST  
**Status:** ⏳ AWAITING APPROVAL  
**Risk Level:** 🟡 Medium (touches NEW SCAN creation logic)

---

## 🎯 Problem to Solve:

**Current bypass vulnerability:**
1. User (Free plan, 1 refresh/day used) has "Automotive" profile
2. User **deletes** "Automotive" profile
3. User **creates new** "Automotive" scan → bypasses refresh limit
4. Repeats infinitely

---

## ✅ Solution: Industry Cooldown Table

### Step 1: New Supabase Table

**File:** `supabase/migrations/add_industry_cooldowns.sql`

```sql
CREATE TABLE public.industry_cooldowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  industry TEXT NOT NULL,
  last_scan_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_industry UNIQUE (user_id, industry),
  CONSTRAINT industry_cooldowns_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_industry_cooldowns_user ON industry_cooldowns(user_id);
CREATE INDEX idx_industry_cooldowns_industry ON industry_cooldowns(industry);
```

---

### Step 2: Code Changes

**File:** `netlify/functions/scan-step.mts`  
**Location:** Inside `stepInit`, NEW SCAN MODE section (after line ~365, before creating scan)

**Add this block:**

```typescript
// ═══════════════════════════════════════════════════════════════
// 🔒 CHECK INDUSTRY COOLDOWN (prevent delete/recreate bypass)
// ═══════════════════════════════════════════════════════════════
console.log('[stepInit] Checking industry cooldown...')

// Cooldown rules by plan (hours)
const cooldownHours: Record<string, number> = {
  free: 24,        // Free: 24h cooldown between same industry scans
  starter: 12,     // Starter: 12h cooldown
  pro: 0,          // Pro: no cooldown (can recreate instantly)
  business: 0,
  enterprise: 0
}

const requiredCooldown = cooldownHours[plan] || cooldownHours.free

if (requiredCooldown > 0) {
  // Check if user created this industry recently
  const cooldownRes = await fetch(
    `${SUPABASE_URL}/rest/v1/industry_cooldowns?user_id=eq.${actualUserId}&industry=eq.${encodeURIComponent(industry)}&select=last_scan_created_at`,
    {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  )
  const cooldowns = await cooldownRes.json()
  
  if (cooldowns && cooldowns.length > 0) {
    const lastCreated = new Date(cooldowns[0].last_scan_created_at)
    const hoursSince = (Date.now() - lastCreated.getTime()) / (1000 * 60 * 60)
    
    if (hoursSince < requiredCooldown) {
      const hoursRemaining = Math.ceil(requiredCooldown - hoursSince)
      console.error(`[stepInit] Industry cooldown active: ${hoursSince.toFixed(1)}h since last ${industry} scan, need ${requiredCooldown}h`)
      throw new Error(`You recently deleted and recreated the "${industry}" profile. Your ${plan} plan requires a ${requiredCooldown}-hour cooldown between creating new scans for the same industry. Please wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} or upgrade for instant access.`)
    }
  }
  
  console.log(`[stepInit] Cooldown check passed (${hoursSince?.toFixed(1) || 'N/A'}h since last scan)`)
}

// ✅ COOLDOWN CHECK PASSED - Continue with scan creation...
```

**Then, AFTER creating the scan (after line ~382), ADD:**

```typescript
// Update cooldown timestamp (upsert)
console.log('[stepInit] Updating industry cooldown timestamp...')
await fetch(`${SUPABASE_URL}/rest/v1/industry_cooldowns`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY!,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'  // Upsert on conflict
  },
  body: JSON.stringify({
    user_id: actualUserId,
    industry,
    last_scan_created_at: new Date().toISOString()
  })
})
console.log('[stepInit] Cooldown timestamp updated')
```

---

## 📊 Behavior by Plan:

| Plan       | Cooldown | Can Recreate After Delete?           |
|------------|----------|--------------------------------------|
| Free       | 24h      | No, must wait 24 hours              |
| Starter    | 12h      | No, must wait 12 hours              |
| Pro        | 0h       | Yes, instantly                      |
| Business   | 0h       | Yes, instantly                      |
| Enterprise | 0h       | Yes, instantly                      |

---

## 🧪 Test Scenario (Free Plan):

1. User creates "Automotive" scan → `industry_cooldowns` records timestamp
2. User deletes "Automotive" scan
3. **Immediately** tries to create "Automotive" again
4. ❌ **Error:** "You recently deleted and recreated the "Automotive" profile. Your free plan requires a 24-hour cooldown..."
5. ✅ **Upgrade modal** appears
6. **23 hours later:** User can create "Automotive" again

---

## ⚠️ Impact Analysis:

### What This Changes:
- ✅ NEW SCAN creation flow (stepInit NEW SCAN MODE)
- ✅ Adds cooldown check BEFORE creating scan
- ✅ Updates cooldown timestamp AFTER creating scan

### What This Doesn't Touch:
- ✅ Refresh logic (PROTECTED - v1.5.3)
- ✅ Manual refresh limits (PROTECTED)
- ✅ Auto-refresh cron (PROTECTED)
- ✅ Existing scans behavior

### Risk Level: 🟡 MEDIUM
- Code is added in NEW SCAN section only
- Does NOT touch refresh limit validation (protected code)
- If cooldown check fails → throws error → stops scan creation (safe)
- If cooldown table doesn't exist → falls back gracefully (fetches return empty)

---

## 🚀 Deployment Steps:

1. ✅ **Run SQL migration** in Supabase (create table)
2. ✅ **Commit code changes** to scan-step.mts
3. ✅ **Deploy to Netlify** (auto-deploy)
4. ✅ **Test with Free plan:**
   - Create "Test Industry" scan
   - Delete it
   - Try to recreate immediately → should fail with cooldown error
   - Check Netlify logs for `[stepInit] Industry cooldown active`

---

## 🔙 Rollback Plan:

If something breaks:
```bash
git revert <commit-hash>
git push
```

Or full rollback to last stable:
```bash
git checkout v1.5.3-limits-working
git push origin main --force
```

---

## ✅ Ready to Implement?

**Attends ta validation David avant de:**
1. Exécuter le SQL dans Supabase
2. Modifier scan-step.mts
3. Commit + push

🦝 **Dis-moi si tu approuves cette approche!**
