# Stripe Products Creation - Launch Pricing

## 🎯 Products to Create in Stripe Dashboard

### Step-by-Step Guide:

1. Go to: https://dashboard.stripe.com/products
2. Click "Add product" for each plan below
3. Copy the LAUNCH price ID (not regular!)
4. Update .env with new price IDs

---

## Products to Create:

### 1. WyzeLens Starter (Regular)
- **Name:** WyzeLens Starter
- **Description:** 3 profiles, 10 competitors, 3 manual refreshes/day, weekly auto-refresh
- **Price:** $49.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_starter_regular
- **Status:** Create but DON'T use (for future)

### 2. WyzeLens Starter (Launch) ⭐ USE THIS
- **Name:** WyzeLens Starter (Launch Special)
- **Description:** 3 profiles, 10 competitors, 3 manual refreshes/day, weekly auto-refresh
- **Price:** $39.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_starter_launch
- **Status:** ✅ USE THIS for checkout

### 3. WyzeLens Pro (Regular)
- **Name:** WyzeLens Pro
- **Description:** 5 profiles, 15 competitors, 6 manual refreshes/day, daily auto-refresh
- **Price:** $99.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_pro_regular
- **Status:** Create but DON'T use (for future)

### 4. WyzeLens Pro (Launch) ⭐ USE THIS
- **Name:** WyzeLens Pro (Launch Special)
- **Description:** 5 profiles, 15 competitors, 6 manual refreshes/day, daily auto-refresh
- **Price:** $79.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_pro_launch
- **Status:** ✅ USE THIS for checkout

### 5. WyzeLens Business (Regular)
- **Name:** WyzeLens Business
- **Description:** 10 profiles, 20 competitors, 12 manual refreshes/day, 6-hour auto-refresh
- **Price:** $149.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_business_regular
- **Status:** Create but DON'T use (for future)

### 6. WyzeLens Business (Launch) ⭐ USE THIS
- **Name:** WyzeLens Business (Launch Special)
- **Description:** 10 profiles, 20 competitors, 12 manual refreshes/day, 6-hour auto-refresh
- **Price:** $119.00 USD / month
- **Recurring:** Monthly
- **ID will be:** price_1xxx_business_launch
- **Status:** ✅ USE THIS for checkout

---

## After Creating Products:

### Copy the LAUNCH price IDs and update:

**File:** `.env`
```bash
# OLD (DELETE THESE):
VITE_STRIPE_PRICE_ID_STARTER=price_1T9T5w01YX9kum4ITE9KZu7M
VITE_STRIPE_PRICE_ID_PRO=price_1T9T6g01YX9kum4IvuUKQBO0
VITE_STRIPE_PRICE_ID_BUSINESS=price_1T9T7q01YX9kum4Itdj8MBrS

# NEW (LAUNCH PRICING - 20% discount):
VITE_STRIPE_PRICE_ID_STARTER=price_1xxx_starter_launch   # $39 (regular $49)
VITE_STRIPE_PRICE_ID_PRO=price_1xxx_pro_launch           # $79 (regular $99)
VITE_STRIPE_PRICE_ID_BUSINESS=price_1xxx_business_launch # $119 (regular $149)
```

**Also update Netlify environment variables:**
1. https://app.netlify.com/sites/wyzelens/configuration/env
2. Add the same 3 variables
3. Redeploy site

---

## Test Checkout Flow:

After updating .env:
1. npm run dev (local test)
2. Click "Start 14-day Trial" for each plan
3. Verify Stripe shows correct price ($39/$79/$119)
4. Cancel before completing (don't create real subscription)
5. Deploy to production
6. Test again on wyzelens.com

---

## Existing Subscribers (Grandfather):

Current subscribers keep their old prices for 6 months:
- David (Business $49) → Stays at $49 until Sept 2026
- New subscribers → Pay launch prices ($39/$79/$119)

After 6 months:
- Email: "Your grandfathered rate expires, moving to $119"
- Or: Keep them at $49 forever (reward early supporters)

---

## Notes:

- Enterprise stays "Contact Sales" (no Stripe product needed)
- Regular prices ($49/$99/$149) are for FUTURE use (after launch period ends)
- Launch prices ($39/$79/$119) are CURRENT active prices

DONE when: .env updated + Netlify env updated + checkout tested ✅
