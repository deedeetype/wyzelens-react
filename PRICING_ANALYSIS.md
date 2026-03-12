# WyzeLens Pricing Analysis - Cost Structure & Profitability

## Current Pricing (Production)
- **Free:** $0/month (1 profile, 5 competitors, 1 manual refresh/day)
- **Starter:** $8/month (3 profiles, 10 competitors, 3 manual/day, daily auto)
- **Pro:** $20/month (5 profiles, 15 competitors, unlimited manual, hourly auto)
- **Business:** $49/month (10 profiles, unlimited competitors, hourly auto)
- **Enterprise:** Contact Sales

---

## 🔍 API Cost Breakdown (Per Scan/Refresh)

### NEW Scan (Full Intelligence Gathering)

**Perplexity API (sonar-pro):**
1. **stepCompetitors():** Find 5-15 competitors
   - Prompt: ~300 tokens
   - Response: ~1,500 tokens (with descriptions)
   - **Cost:** ~$0.003 per request (1,800 tokens @ $1/1M input, $3/1M output estimate)

2. **stepNews():** Fetch 20 news articles
   - Prompt: ~250 tokens
   - Response: ~3,000 tokens (20 articles with summaries)
   - **Cost:** ~$0.010 per request

3. **Watchlist enrichment** (if 3 items added):
   - Prompt: ~200 tokens
   - Response: ~1,000 tokens
   - **Cost:** ~$0.004 per request

**Claude Sonnet 4.5 (via Poe):**
4. **analyzeCompetitors():** Threat analysis
   - Input: ~2,000 tokens (competitor list)
   - Output: ~1,500 tokens
   - **Cost:** ~$0.015 (Poe API pricing unknown, estimate based on Claude)

5. **analyzeInsights():** Strategic insights
   - Input: ~3,000 tokens (news + competitors)
   - Output: ~2,000 tokens
   - **Cost:** ~$0.020

6. **analyzeAlerts():** Competitive alerts
   - Input: ~3,000 tokens
   - Output: ~1,500 tokens
   - **Cost:** ~$0.018

**Total per NEW scan:** ~$0.07 USD

---

### REFRESH (Updates Only - Cheaper!)

**Perplexity:**
1. **stepNews():** Latest news
   - **Cost:** ~$0.010

2. **Watchlist enrichment** (if items added):
   - **Cost:** ~$0.004 (occasional)

3. **Backfill** (if watchlist items removed):
   - **Cost:** ~$0.005 (occasional)

**Claude:**
4. **analyzeInsights():** New insights
   - **Cost:** ~$0.020

5. **analyzeAlerts():** New alerts
   - **Cost:** ~$0.018

**Total per REFRESH:** ~$0.05 USD (no competitor discovery!)

---

## 💰 Monthly Cost Per User (Realistic Usage)

### FREE Plan
- **1 profile, 1 refresh/day**
- Month 1: 1 NEW scan ($0.07) + 29 refreshes ($0.05 × 29 = $1.45)
- **Monthly cost:** ~$1.52
- **Revenue:** $0
- **Loss:** -$1.52 per user ❌

### STARTER Plan ($8/month)
- **3 profiles, 3 refreshes/day, daily auto**
- Month 1: 3 NEW scans ($0.21) + 90 manual ($4.50) + 90 auto ($4.50)
- **Monthly cost:** ~$9.21
- **Revenue:** $8
- **Loss:** -$1.21 per user ❌

### PRO Plan ($20/month)
- **5 profiles, unlimited manual, hourly auto**
- Month 1: 5 NEW scans ($0.35) + 150 manual ($7.50) + 720 auto ($36.00)
- **Monthly cost:** ~$43.85
- **Revenue:** $20
- **Loss:** -$23.85 per user ❌❌❌

### BUSINESS Plan ($49/month)
- **10 profiles, unlimited competitors, hourly auto**
- Month 1: 10 NEW scans ($0.70) + 300 manual ($15.00) + 720 auto ($36.00)
- **Monthly cost:** ~$51.70
- **Revenue:** $49
- **Loss:** -$2.70 per user ❌

---

## 🚨 CRITICAL ISSUES

### 1. Hourly Auto-Refresh = HUGE cost
- 24 refreshes/day × 30 days = **720 refreshes/month**
- Cost: 720 × $0.05 = **$36/month per profile!**
- Pro (5 profiles): $36 × 5 = **$180/month cost** vs $20 revenue ❌

### 2. Unlimited Manual Refreshes (Pro+)
- Power users could trigger 10-20 refreshes/day
- Cost: 20 × 30 = 600 refreshes/month = **$30/month**

### 3. FREE Plan Too Generous
- $1.52/month cost with $0 revenue
- 100 free users = -$152/month loss

---

## 💡 RECOMMENDED NEW PRICING

### Strategy: Reduce auto-refresh frequency + increase prices

### FREE Plan - $0/month
**Keep as lead magnet, but limit API usage:**
- 1 profile
- 5 competitors
- 1 manual refresh/day
- ❌ NO auto refresh
- **Monthly cost:** ~$1.50 (acceptable loss for acquisition)

### STARTER Plan - $19/month (was $8)
**Target: Casual users, light monitoring**
- 3 profiles
- 10 competitors
- 3 manual refreshes/day
- **Weekly** auto-refresh (NOT daily)
- **Monthly cost:** ~$3.50 (4 weekly auto × 3 profiles × 4 weeks = 48 refreshes + 90 manual = $7.90)
- **Profit:** $19 - $7.90 = **+$11.10** ✅

### PRO Plan - $49/month (was $20)
**Target: Active users, regular monitoring**
- 5 profiles
- 20 competitors (was 15)
- 10 manual refreshes/day
- **Daily** auto-refresh (NOT hourly)
- **Monthly cost:** ~$16.00 (30 daily auto × 5 profiles = 150 + 300 manual = $22.50)
- **Profit:** $49 - $22.50 = **+$26.50** ✅

### BUSINESS Plan - $99/month (was $49)
**Target: Teams, multiple industries**
- 10 profiles
- Unlimited competitors
- Unlimited manual refreshes
- **Every 6 hours** auto-refresh (NOT hourly)
- **Monthly cost:** ~$32.00 (4 refreshes/day × 10 profiles × 30 = 1,200 refreshes)
- **Profit:** $99 - $32.00 = **+$67.00** ✅

### ENTERPRISE Plan - $299/month (was Contact Sales)
**Target: Large organizations, API access**
- Unlimited profiles
- Unlimited competitors
- Unlimited manual
- **Hourly** auto-refresh (premium feature)
- API access
- Custom integrations
- **Monthly cost:** ~$150.00 (estimate, high usage)
- **Profit:** $299 - $150.00 = **+$149.00** ✅

---

## 📊 PROFIT MARGIN COMPARISON

| Plan | Current Price | Current Cost | Current Profit | New Price | New Cost | New Profit | Margin |
|------|---------------|--------------|----------------|-----------|----------|------------|--------|
| Free | $0 | $1.50 | -$1.50 ❌ | $0 | $1.50 | -$1.50 | -100% |
| Starter | $8 | $9.21 | -$1.21 ❌ | $19 | $7.90 | +$11.10 | 58% ✅ |
| Pro | $20 | $43.85 | -$23.85 ❌ | $49 | $22.50 | +$26.50 | 54% ✅ |
| Business | $49 | $51.70 | -$2.70 ❌ | $99 | $32.00 | +$67.00 | 68% ✅ |
| Enterprise | Contact | - | - | $299 | $150.00 | +$149.00 | 50% ✅ |

---

## 🎯 KEY CHANGES TO IMPLEMENT

### 1. Reduce Auto-Refresh Frequency

**Current (BLEEDING MONEY):**
- Pro: Hourly (720/month) = $36/month cost
- Business: Hourly (720/month × profiles) = $360/month cost

**Recommended:**
- Starter: Weekly (12/month)
- Pro: Daily (30/month)
- Business: Every 6h (120/month)
- Enterprise: Hourly (720/month) - justified by $299 price

### 2. Increase Prices (Market Positioning)

**Current pricing is too low for value delivered:**
- AI-powered competitive intelligence
- Real-time monitoring
- Strategic insights
- Comparable tools (Crayon, Klue) charge $12k-$15k/year

**Competitor pricing:**
- Crayon: ~$15,000/year (~$1,250/month)
- Klue: ~$12,000/year (~$1,000/month)
- Kompyte: ~$10,000/year (~$833/month)

**WyzeLens at $49-$99 is already 95% cheaper!**

### 3. Soft Caps on Manual Refreshes

**Pro Plan:** 10 refreshes/day = 300/month (~$15 cost)
- If user hits limit: "Upgrade to Business for unlimited"
- Prevents abuse

**Business Plan:** Unlimited but monitor for abuse
- If >50 refreshes/day: Email check-in
- Most users won't hit this

---

## 🚀 RECOMMENDED ROLLOUT

### Phase 1: Update Auto-Refresh Frequencies (Backend)
```typescript
// In run-scheduled-scans.mts
const refreshIntervals = {
  free: null,        // No auto
  starter: 'weekly', // Every 7 days
  pro: 'daily',      // Every 24h
  business: '6h',    // Every 6h
  enterprise: 'hourly' // Every 1h
}
```

### Phase 2: Update Pricing Page (Frontend)
```typescript
// src/pages/Pricing.tsx
const plans = [
  { name: 'Free', price: 0, ... },
  { name: 'Starter', price: 19, features: ['Weekly auto-refresh', ...] },
  { name: 'Pro', price: 49, features: ['Daily auto-refresh', ...] },
  { name: 'Business', price: 99, features: ['6-hour auto-refresh', ...] },
  { name: 'Enterprise', price: 299, features: ['Hourly auto-refresh', ...] }
]
```

### Phase 3: Update Stripe Products
```
1. Create new price points in Stripe dashboard
2. Deprecate old prices (don't delete - existing subscribers)
3. Update VITE_STRIPE_PRICE_ID_* env vars
4. Test checkout flow
```

### Phase 4: Grandfather Existing Users (Optional)
```
Email existing subscribers:
"We're increasing prices to sustain development.
Your current rate ($8/$20/$49) is locked in for 12 months.
After that: Starter $19, Pro $49, Business $99.
Thank you for being an early supporter!"
```

---

## 💵 PROFIT FORECAST (100 Users)

### Current Pricing:
- 10 Free: -$15/month
- 30 Starter: -$36/month
- 40 Pro: -$954/month ❌❌❌
- 20 Business: -$54/month
- **Total:** -$1,059/month (LOSING MONEY!)

### New Pricing:
- 10 Free: -$15/month (acquisition cost)
- 30 Starter: +$333/month
- 40 Pro: +$1,060/month
- 20 Business: +$1,340/month
- **Total:** +$2,718/month profit ✅

**Break-even:** ~6 paying users (1 Pro + 1 Business)

---

**Want me to implement the pricing changes?** 🎯