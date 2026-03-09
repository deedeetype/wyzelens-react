# WyzeLens Restore Points

## 🎯 v1.6.0-golive-ready (2026-03-09) ← **CURRENT**

**Status:** Production-Ready for Go-Live 🚀

**Major Features:**
- ✅ LinkedIn share functionality (text-based posts)
- ✅ Simplified 2-step onboarding
- ✅ Plan-based Settings with upgrade CTAs
- ✅ Correct plan limits enforcement
- ✅ Support contact integration

**Plan Limits (AUDITED & VERIFIED):**
- FREE: 1 profile, 5 competitors, 1 manual/day, NO auto-refresh
- STARTER: 3 profiles, 10 competitors, 3 manual/day, daily auto
- PRO: 5 profiles, 15 competitors, unlimited manual, hourly auto + features
- BUSINESS: 10 profiles, unlimited competitors, hourly auto + all features

**Critical Fixes:**
- ❌ Removed incorrect weekly auto-refresh for FREE
- ✅ Cron job skips FREE scans completely
- ✅ UI shows "Manual Refresh Only" for FREE
- ✅ Competitor AI prompts enforce exact count
- ✅ Bulk operations refresh UI immediately

**Restore command:**
```bash
git checkout v1.6.0-golive-ready
```

---

## v1.5.1-activity-log-stable (2026-03-06)

**Status:** Stable with Activity Log

**Major Features:**
- Activity Log with automated/manual refresh tracking
- NEW badges on latest refresh items
- localStorage scoped by userId
- Stripe payment integration (test mode)
- Production pricing: $0/$8/$20/$49/Contact

**Restore command:**
```bash
git checkout v1.5.1-activity-log-stable
```

---

## v1.0.0-stripe-stable (2026-03-03)

**Status:** First stable release with Stripe

**Major Features:**
- Stripe checkout integration
- Subscription management
- Clerk authentication
- Basic dashboard functionality

**Restore command:**
```bash
git checkout v1.0.0-stripe-stable
```

---

## Restore Workflow

1. **Check current status:**
   ```bash
   git tag -l -n9 "v*"
   git log --oneline -10
   ```

2. **Restore to specific version:**
   ```bash
   git checkout v1.6.0-golive-ready
   npm install
   npm run build
   ```

3. **Return to latest:**
   ```bash
   git checkout main
   ```

4. **Create new restore point:**
   ```bash
   git tag -a vX.Y.Z-description -m "Release notes..."
   git push origin vX.Y.Z-description
   ```

---

## Current Production URL

https://wyzelens.com (Netlify auto-deploy from `main` branch)

---

**Last Updated:** 2026-03-09 15:38 EDT
