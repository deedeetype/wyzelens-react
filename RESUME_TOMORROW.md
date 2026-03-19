# 🌅 Resume Tomorrow - Quick Start Guide

## ✅ What's Done (Session: Mar 11-12, 2026)

### Phase 2: Watchlist Features COMPLETE
- ✅ Refresh detection (watchlist changes apply during refresh)
- ✅ Enrichment (full company details for watchlist items)
- ✅ Backfill (maintain count when removing from watchlist)
- ✅ Bug fixes (duplicates, 0 competitors, calculation errors)

### Pricing Update: DEPLOYED (Code Only)
- ✅ Backend limits: Manual refresh caps (6/12), competitor caps (15/20)
- ✅ Frontend: New prices ($39/$79/$119 with strikethrough)
- ✅ Stripe products created (launch pricing)
- ✅ .env.local updated with new price IDs

---

## ⏳ What's PENDING (YOU do tomorrow)

### 1. Update Netlify Environment Variables (5 min) ⚠️ CRITICAL

**Go to:** https://app.netlify.com/sites/wyzelens/configuration/env

**Update these 3 variables:**
```
VITE_STRIPE_PRICE_ID_STARTER  = price_1TA1P401YX9kum4Ioo6gJskA
VITE_STRIPE_PRICE_ID_PRO      = price_1TA1Rf01YX9kum4IkKeysNYG
VITE_STRIPE_PRICE_ID_BUSINESS = price_1TA1SG01YX9kum4IYXj7rceo
```

**Click "Save"** → Netlify auto-redeploys

---

### 2. Test Checkout Flow (10 min)

After Netlify redeploys:
1. Go to https://wyzelens.com/pricing
2. Click "Start 14-day Trial" for Starter
3. Verify Stripe shows **$39.00/month** ✅
4. Cancel (don't complete)
5. Repeat for Pro ($79) and Business ($119)

---

### 3. Monitor Production (24-48h)

**Check:**
- New signups use correct prices
- Manual refresh limits enforce (users see "X/Y left today")
- No ESM errors in Netlify logs
- Watchlist features work (enrichment, backfill)

**Logs to watch:**
```
[REFRESH] Manual refresh count today: X/6 (Pro)
[REFRESH] Manual refresh count today: X/12 (Business)
[ENRICH-WATCHLIST] Enriched X/X items
[REFRESH] ✅ Backfilled X auto-discovered competitors
```

---

## 📊 Current Status

**Version:** v1.2.0-pricing-update (commit 355ac72)  
**Tag created:** ✅  
**Code deployed:** ✅  
**Netlify env vars:** ⏳ PENDING  
**Pricing live:** ⏳ After env vars update

---

## 🚀 Quick Commands (if needed)

### Check current deploy:
```bash
cd /data/.openclaw/workspace/business/wyzelens-react
git status
git log --oneline -5
```

### Rollback if issues:
```bash
git reset --hard c3f682b  # v1.1.0-watchlist-stable (before Phase 2)
git push origin main --force
```

### View pricing docs:
```bash
cat NEW_PRICING_SUMMARY.md        # Summary + next steps
cat UPDATE_NETLIFY_ENV.md         # Netlify env guide
cat PRICING_WORST_CASE.md         # Full cost analysis
```

---

## 🎯 Tomorrow's Goals

1. ✅ Update Netlify env vars (5 min)
2. ✅ Test checkout ($39/$79/$119)
3. Monitor for 24h
4. (Optional) Email existing subscribers about grandfather pricing

---

## 📁 Key Files

- `netlify/functions/refresh-scan.mts` - Manual caps, enrichment, backfill
- `src/lib/subscription.ts` - Plan definitions
- `src/pages/Pricing.tsx` - Pricing page
- `src/components/SettingsView.tsx` - Competitor options

---

**Restore point:** v1.2.0-pricing-update (355ac72)  
**Fallback:** v1.1.0-watchlist-stable (c3f682b)

🌙 Bonne nuit! Prêt à reprendre demain!
