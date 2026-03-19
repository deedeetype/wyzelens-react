# WyzeLens Restore Points

## v1.6.0-trial-complete (2026-03-18) ⭐ LATEST
**Commit:** 4fee97b  
**Status:** Production-ready  
**Features:**
- 7-day free trial enforcement (Clerk user.createdAt)
- Trial countdown banners (blue → amber → red)
- Full-screen overlay when expired
- UpgradeModal pricing updated ($39/$79 launch)
- Trial banners positioned at dashboard top

**Restore command:**
```bash
git checkout v1.6.0-trial-complete
npm install
npm run build
git push origin main --force  # If deploying this version
```

**Testing notes:**
- Free users: trial calculated from Clerk account creation
- Paid users: Stripe webhook + user_subscriptions
- See TEST_TRIAL.md for test scenarios

---

## v1.5.1-activity-log-stable (2026-03-06)
**Commit:** 364449c  
**Features:**
- Automated refresh (hourly via GitHub Actions)
- Manual refresh with daily limits
- Activity Log with counts
- localStorage isolated by userId

---

## v1.2.0-watchlist-refresh (2026-03-11)
**Commit:** Previous watchlist implementation  
**Features:**
- Watchlist competitor tracking
- Regional filters (Pro+ only)

---

## v1.1.4-email-images-fixed (WyzeNews)
**Path:** /data/.openclaw/workspace/business/daily-digest/  
**Commit:** 7a38272  
**Features:**
- Email images with CID attachments
- BCC batch mode for scaling
- Double validation workflow

---

## How to restore

1. **View all tags:**
   ```bash
   git tag -l
   ```

2. **Restore to specific version:**
   ```bash
   git checkout v1.6.0-trial-complete
   npm install
   npm run build
   ```

3. **Create new branch from tag:**
   ```bash
   git checkout -b fix-from-v1.6.0 v1.6.0-trial-complete
   ```

4. **Force deploy tag to main:**
   ```bash
   git checkout v1.6.0-trial-complete
   git branch -D main
   git checkout -b main
   git push origin main --force
   ```

---

Last updated: 2026-03-18 22:31 EDT
