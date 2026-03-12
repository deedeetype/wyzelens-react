# WyzeLens - Restore Points

Stable checkpoints for quick rollback if needed.

---

## 🏷️ Production Tags

### **v1.1.0-watchlist-stable** (2026-03-11) ⭐ CURRENT
**Commit:** `c3f682b`  
**Features:**
- ✅ Watchlist priority for competitors (Pro+ feature)
- ✅ URL/domain matching for watchlist items
- ✅ SEO optimization (Google rich results)
- ✅ UI/UX improvements (light theme, settings)
- ✅ Bug fixes (cross-user isolation, name population)

**Rollback:**
```bash
git reset --hard v1.1.0-watchlist-stable
git push origin main --force
```

---

### **v1.6.0-pre-watchlist** (2026-03-11)
**Commit:** `3b9e893`  
**Features:**
- ✅ SEO optimization
- ✅ Light theme cleanup
- ✅ Full Rescan button removed
- ✅ Default industry in New Scan modal
- ❌ NO watchlist feature yet

**Rollback:**
```bash
git reset --hard v1.6.0-pre-watchlist
git push origin main --force
```

---

### **v1.0.0-stripe-stable** (2026-03-06)
**Commit:** `117d1b8`  
**Features:**
- ✅ Stripe LIVE mode integration
- ✅ Clerk authentication
- ✅ Blog articles (3)
- ✅ Data sources section
- ✅ Testimonials

**Rollback:**
```bash
git reset --hard v1.0.0-stripe-stable
git push origin main --force
```

---

## 📋 Quick Reference

| Tag | Date | Commit | Key Feature | Status |
|-----|------|--------|-------------|--------|
| `v1.1.0-watchlist-stable` | 2026-03-11 | `c3f682b` | Watchlist priority | ⭐ Current |
| `v1.6.0-pre-watchlist` | 2026-03-11 | `3b9e893` | Pre-watchlist stable | ✅ Stable |
| `v1.0.0-stripe-stable` | 2026-03-06 | `117d1b8` | Stripe payments | ✅ Stable |

---

## 🚨 Emergency Rollback

### **Option A: Git Reset (Fastest)**
```bash
# Rollback to specific version
git reset --hard v1.1.0-watchlist-stable  # Or any other tag
git push origin main --force

# Netlify will auto-deploy the rolled-back version
```

### **Option B: Netlify UI (No Git)**
1. Go to: https://app.netlify.com/sites/wyzelens/deploys
2. Find the deploy you want to restore
3. Click **"Publish deploy"**
4. ✅ Instant rollback (30 seconds)

### **Option C: Create Hotfix Branch**
```bash
# For urgent fixes without full rollback
git checkout -b hotfix/issue-name v1.1.0-watchlist-stable
# Make fix
git commit -am "hotfix: description"
git push origin hotfix/issue-name
# Deploy via Netlify branch deploy
```

---

## 📝 Creating New Restore Points

### **When to create:**
- ✅ After major feature deployment
- ✅ Before risky changes
- ✅ After successful production validation (24h)
- ✅ Before merging large PRs

### **How to create:**
```bash
# 1. Ensure you're on a stable commit
git log --oneline -5

# 2. Create annotated tag
git tag -a v1.X.0-feature-name -m "Release v1.X.0: Feature Description

Features:
- Feature 1
- Feature 2

Fixes:
- Bug fix 1

Deploy date: YYYY-MM-DD" <commit-hash>

# 3. Push to GitHub
git push origin v1.X.0-feature-name

# 4. Update this file (RESTORE_POINTS.md)
```

---

## 🔍 Verify Current Version

```bash
# Check current commit
git log --oneline -1

# Check current tag
git describe --tags --abbrev=0

# Compare with tag
git diff v1.1.0-watchlist-stable HEAD
```

---

## 📊 Rollback Decision Matrix

| Scenario | Action | Rollback To |
|----------|--------|-------------|
| Critical bug in watchlist | Option B (Netlify UI) | Previous deploy |
| Watchlist causing errors | Option A (Git reset) | `v1.6.0-pre-watchlist` |
| Total system failure | Option A (Git reset) | `v1.0.0-stripe-stable` |
| Minor UI issue | Option C (Hotfix branch) | N/A (fix forward) |

---

## ⚠️ Post-Rollback Checklist

```
[ ] Verify app loads in production
[ ] Test user login (Clerk)
[ ] Test scan creation (basic flow)
[ ] Check database queries (no errors)
[ ] Verify Stripe checkout (if payments affected)
[ ] Monitor logs for 30 minutes
[ ] Update team/users if needed
```

---

**Last updated:** 2026-03-11  
**Maintainer:** David Laborieux
