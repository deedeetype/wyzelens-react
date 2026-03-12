# Update Netlify Environment Variables

## 🎯 Go to Netlify Dashboard:
https://app.netlify.com/sites/wyzelens/configuration/env

## Variables to UPDATE (replace old values):

### 1. VITE_STRIPE_PRICE_ID_STARTER
**Old:** price_1T9T5w01YX9kum4ITE9KZu7M
**New:** price_1TA1P401YX9kum4Ioo6gJskA
**Value:** $39/month (launch pricing)

### 2. VITE_STRIPE_PRICE_ID_PRO
**Old:** price_1T9T6g01YX9kum4IvuUKQBO0
**New:** price_1TA1Rf01YX9kum4IkKeysNYG
**Value:** $79/month (launch pricing)

### 3. VITE_STRIPE_PRICE_ID_BUSINESS
**Old:** price_1T9T7q01YX9kum4Itdj8MBrS
**New:** price_1TA1SG01YX9kum4IYXj7rceo
**Value:** $119/month (launch pricing)

---

## After Updating:

1. Click "Save" in Netlify
2. Netlify will auto-redeploy (~2-3 min)
3. Test checkout flow on https://wyzelens.com
4. Verify Stripe Checkout shows correct prices

---

## Test Checklist:

- [ ] Go to https://wyzelens.com/pricing
- [ ] Click "Start 14-day Trial" for Starter
- [ ] Verify Stripe shows $39.00/month ✅
- [ ] Cancel (don't complete)
- [ ] Repeat for Pro ($79) and Business ($119)
- [ ] All 3 prices correct ✅

---

Done! 🎉
