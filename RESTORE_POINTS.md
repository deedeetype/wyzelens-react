# 🔖 WyzeLens Restore Points

This file documents safe restore points for the WyzeLens application.

---

## 📌 v1.0.0-production-golive (March 11, 2026)

**Status:** 🟢 **PRODUCTION LIVE**

**Commit:** `117d1b8`  
**Tag:** `v1.0.0-production-golive`  
**Domain:** https://wyzelens.com

### ✅ What's Working:

#### Authentication (Clerk)
- ✅ Production DNS: `clerk.wyzelens.com`, `accounts.wyzelens.com`
- ✅ SSL certificates active
- ✅ JWT Template with custom Supabase signing key
- ✅ Webhook: `https://wyzelens.com/.netlify/functions/clerk-webhook`
- ✅ User auto-creation in Supabase

#### Payments (Stripe)
- ✅ **LIVE mode** active
- ✅ 3 products: Starter ($8), Pro ($20), Business ($49)
- ✅ Live Price IDs:
  - `price_1T9T5w01YX9kum4ITE9KZu7M` (Starter)
  - `price_1T9T6g01YX9kum4IvuUKQBO0` (Pro)
  - `price_1T9T7q01YX9kum4Itdj8MBrS` (Business)
- ✅ Webhook: `https://wyzelens.com/.netlify/functions/stripe-webhook`
- ✅ Checkout flow functional
- ✅ Subscriptions tracked in Supabase

#### Database (Supabase)
- ✅ RLS enabled on all tables
- ✅ Policies configured for Clerk JWT
- ✅ JWT Issuer: `https://clerk.wyzelens.com`
- ✅ Tables: users, scans, competitors, alerts, insights, news_feed, user_subscriptions, refresh_logs

#### Features
- ✅ Automated hourly/daily refresh (GitHub Actions)
- ✅ Manual refresh with plan-based limits (Free: 1/day, Starter: 3/day, Pro+: unlimited)
- ✅ NEW badges (reset each refresh, only on latest items)
- ✅ Activity Log with counts (0 alerts · 0 insights · 0 news)
- ✅ Plan feature locks (watchlist, regional filters for Pro+)
- ✅ History retention (7/30/90/unlimited days - display only)

#### Design
- ✅ WyzeLens white logo (40px nav, 48px dashboard)
- ✅ Complete favicon suite (ico, svg, png, apple-touch-icon)
- ✅ PWA manifest
- ✅ Responsive mobile design

#### Content
- ✅ Landing page with testimonials + data sources
- ✅ 3 SEO-optimized blog articles (1500-2000 words each)
- ✅ Special launch pricing (strikethrough original prices)

### 🔧 Environment Variables (Production):

```bash
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (your key)
CLERK_SECRET_KEY=sk_test_... (your key)
CLERK_WEBHOOK_SECRET=whsec_... (your key)

# Supabase
VITE_SUPABASE_URL=https://erkzlqgpbrxokyqtrgnf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (your key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your key)

# Stripe LIVE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (LIVE)
STRIPE_SECRET_KEY=sk_live_... (LIVE)
STRIPE_WEBHOOK_SECRET=whsec_... (LIVE)
STRIPE_PRICE_STARTER=price_1T9T5w01YX9kum4ITE9KZu7M
STRIPE_PRICE_PRO=price_1T9T6g01YX9kum4IvuUKQBO0
STRIPE_PRICE_BUSINESS=price_1T9T7q01YX9kum4Itdj8MBrS

# APIs
PERPLEXITY_API_KEY=pplx-... (your key)
POE_API_KEY=... (your key)

# URLs
VITE_APP_URL=https://wyzelens.com
URL=https://wyzelens.com
```

### 📦 Stack:
- React 18 + Vite 7.3.1 + TypeScript
- Tailwind CSS + Lucide Icons
- Clerk (auth)
- Supabase (database + RLS)
- Stripe (payments)
- Netlify (hosting + functions)
- Perplexity AI (sonar-pro)
- Poe API (Claude-Sonnet-4.5)

### 🏷️ To Restore:

```bash
git checkout v1.0.0-production-golive
npm install
npm run build
# Then redeploy on Netlify or push to main
```

### 📋 Known Issues/Notes:

- Clerk still in TEST mode (pk_test_...) with custom JWT signing configured
- Stripe LIVE but may need banking activation depending on jurisdiction
- Blog hero images are Python-generated gradients (functional but could be replaced with professional photos)

### 🔄 Next Steps (Future):

- [ ] Migrate Clerk to full LIVE mode (pk_live_...)
- [ ] Complete Stripe banking activation if needed
- [ ] Add website change tracking (Kompyte-like feature)
- [ ] Build battlecards feature
- [ ] CRM integrations (API-based)
- [ ] Weekly email digest
- [ ] Slack webhook integration
- [ ] Export reports (PDF/Excel)

---

## How to Use This File:

1. **When making major changes**, create a new restore point:
   ```bash
   git tag -a v1.x.x-feature-name -m "Description"
   git push origin v1.x.x-feature-name
   ```

2. **Document it here** with:
   - What works
   - What changed
   - How to restore
   - Known issues

3. **Keep this file updated** in the repo so future you (or collaborators) can quickly restore working states.

---

*Last updated: March 11, 2026*
