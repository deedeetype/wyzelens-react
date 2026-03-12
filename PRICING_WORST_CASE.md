# WyzeLens Pricing Analysis - Worst Case Scenarios (Maximum Usage)

## API Cost Breakdown (Per Operation)
- **NEW Scan:** $0.07 (Perplexity + Claude, full intelligence)
- **Refresh:** $0.05 (News + Insights + Alerts)
- **Watchlist enrichment:** $0.004 (per item)
- **Backfill:** $0.005 (per competitor)

---

## 💰 COST ANALYSIS - REALISTIC vs WORST CASE

| Plan | Price | Profiles | Manual/day | Auto-refresh | **Realistic Usage** | **Realistic Cost** | **Worst Case Usage** | **Worst Case Cost** | **Profit (Realistic)** | **Profit (Worst)** |
|------|-------|----------|------------|--------------|---------------------|-------------------|---------------------|-------------------|---------------------|------------------|
| **Free** | $0 | 1 | 1 | None | 1 NEW + 30 refreshes | $1.52 | 1 NEW + 30 refreshes (max) | $1.52 | **-$1.52** ❌ | **-$1.52** ❌ |
| **Starter** <br>($8 current) | $8 | 3 | 3 | Daily | 3 NEW + 90 manual + 90 auto | $9.21 | 3 NEW + 270 manual + 90 auto | $18.21 | **-$1.21** ❌ | **-$10.21** ❌ |
| **Pro** <br>($20 current) | $20 | 5 | Unlimited | Hourly | 5 NEW + 150 manual + 3,600 auto | $187.35 | 5 NEW + 1,500 manual + 3,600 auto | $255.35 | **-$167.35** ❌❌❌ | **-$235.35** ❌❌❌ |
| **Business** <br>($49 current) | $49 | 10 | Unlimited | Hourly | 10 NEW + 300 manual + 7,200 auto | $375.70 | 10 NEW + 3,000 manual + 7,200 auto | $510.70 | **-$326.70** ❌❌❌ | **-$461.70** ❌❌❌ |

---

## 🚨 CRITICAL: Current Pricing is UNSUSTAINABLE

### Worst Case Pro User (10 refreshes/day manual):
```
5 profiles × 24 hourly auto = 120 refreshes/day
10 manual refreshes/day
Total: 130 refreshes/day × 30 days = 3,900 refreshes/month
Cost: 3,900 × $0.05 = $195/month
Revenue: $20/month
LOSS: -$175/month per user ❌❌❌
```

### Worst Case Business User (100 refreshes/day manual):
```
10 profiles × 24 hourly auto = 240 refreshes/day
100 manual refreshes/day (power user)
Total: 340 refreshes/day × 30 days = 10,200 refreshes/month
Cost: 10,200 × $0.05 = $510/month
Revenue: $49/month
LOSS: -$461/month per user ❌❌❌
```

**One abusive user could cost you $461/month!** 😱

---

## 💡 RECOMMENDED NEW PRICING (Worst Case Safe)

| Plan | New Price | Profiles | Manual/day | Auto-refresh | **Realistic Usage** | **Realistic Cost** | **Worst Case Usage** | **Worst Case Cost** | **Profit (Realistic)** | **Profit (Worst)** | **Status** |
|------|-----------|----------|------------|--------------|---------------------|-------------------|---------------------|-------------------|---------------------|------------------|---------|
| **Free** | $0 | 1 | 1 | ❌ None | 1 NEW + 30 manual | $1.52 | 1 NEW + 30 manual | $1.52 | **-$1.52** | **-$1.52** | Acquisition cost ✅ |
| **Starter** | **$19** | 3 | 3 | 📅 Weekly | 3 NEW + 90 manual + 36 auto | $7.91 | 3 NEW + 270 manual + 36 auto | $16.71 | **+$11.09** ✅ | **+$2.29** ✅ |
| **Pro** | **$49** | 5 | 10 | 📅 Daily | 5 NEW + 300 manual + 150 auto | $22.85 | 5 NEW + 1,500 manual + 150 auto | $82.85 | **+$26.15** ✅ | **-$33.85** ⚠️ |
| **Business** | **$99** | 10 | 20 | ⏰ Every 6h | 10 NEW + 600 manual + 1,200 auto | $91.70 | 10 NEW + 6,000 manual + 1,200 auto | $361.70 | **+$7.30** ✅ | **-$262.70** ❌ |
| **Enterprise** | **$299** | Unlimited | Unlimited | ⚡ Hourly | 20 NEW + 1,000 manual + 7,200 auto | $411.40 | 50 NEW + 10,000 manual + 14,400 auto | $1,223.50 | **-$112.40** ⚠️ | **-$924.50** ❌ |

---

## 🚨 PROBLEM: Even NEW pricing has worst-case vulnerabilities!

**Pro worst case:** -$33.85 (if user does 50 manual refreshes/day)
**Business worst case:** -$262.70 (if user does 200 manual refreshes/day)
**Enterprise worst case:** -$924.50 (if unlimited abuse)

---

## 🛡️ SOLUTION: Add Hard Caps on Manual Refreshes

### Revised Plan Limits:

| Plan | Price | Profiles | **Manual/day (HARD CAP)** | Auto | Realistic Cost | Worst Cost | Profit (Realistic) | Profit (Worst) |
|------|-------|----------|--------------------------|------|----------------|------------|-------------------|---------------|
| **Free** | $0 | 1 | **1 (enforced)** | None | $1.52 | $1.52 | -$1.52 | -$1.52 |
| **Starter** | **$24** | 3 | **3 (enforced)** | Weekly | $7.91 | $16.71 | **+$16.09** ✅ | **+$7.29** ✅ |
| **Pro** | **$59** | 5 | **10 (enforced)** | Daily | $22.85 | $32.85 | **+$36.15** ✅ | **+$26.15** ✅ |
| **Business** | **$149** | 10 | **20 (enforced)** | Every 6h | $91.70 | $101.70 | **+$57.30** ✅ | **+$47.30** ✅ |
| **Enterprise** | **$399** | 20 | **50 (enforced)** | Hourly | $211.40 | $331.40 | **+$187.60** ✅ | **+$67.60** ✅ |

---

## 🎯 FINAL RECOMMENDED PRICING (Safe from abuse)

### Key Changes:
1. ✅ **Hard caps on manual refreshes** (enforce in backend)
2. ✅ **Reduced auto-refresh frequency** (weekly/daily/6h/hourly)
3. ✅ **Higher prices** (reflect value, protect margins)
4. ✅ **Worst case still profitable** (except Free - acceptable)

### Implementation:

#### Backend (enforce limits):
```typescript
// In refresh-scan.mts
const manualLimits = {
  free: 1,
  starter: 3,
  pro: 10,
  business: 20,
  enterprise: 50
}

if (manualRefreshCount >= manualLimits[plan]) {
  throw new Error(`Daily limit reached. Your ${plan} plan allows ${limit} manual refreshes per day.`)
}
```

#### Frontend (show remaining):
```typescript
// In Dashboard.tsx
<button>
  Refresh ({remainingToday}/{dailyLimit} left today)
</button>
```

---

## 📊 COMPETITOR COMPARISON

| Tool | Monthly Price | Your Price | Savings |
|------|--------------|------------|---------|
| Crayon | $1,250 | $59 (Pro) | 95% |
| Klue | $1,000 | $149 (Business) | 85% |
| Kompyte | $833 | $399 (Enterprise) | 52% |

**Even at $399, you're HALF the price of competitors!** 🎯

---

## 🚀 ROLLOUT PLAN

### Phase 1: Backend Limits (Critical - do first!)
1. Enforce hard caps on manual refreshes
2. Change auto-refresh: daily → weekly (Starter)
3. Change auto-refresh: hourly → daily (Pro)
4. Change auto-refresh: hourly → 6h (Business)
5. Test limits work
6. **Deploy immediately (protect cash flow)**

### Phase 2: Pricing Update (Frontend + Stripe)
1. Update Pricing.tsx ($24/$59/$149/$399)
2. Create new Stripe products
3. Update env vars
4. Test checkout
5. Deploy

### Phase 3: Grandfather Existing Users
1. Email: "Price increase in 30 days, current rate locked 6 months"
2. After 6 months: Migrate to new pricing

---

## 🎯 ACTION ITEMS

**URGENT (This week):**
- [ ] Enforce manual refresh hard caps (backend)
- [ ] Reduce auto-refresh frequencies (backend)
- [ ] Update Stripe products ($24/$59/$149/$399)
- [ ] Update pricing page (frontend)

**Important (Next week):**
- [ ] Email existing subscribers (grandfather notice)
- [ ] Add "X/Y refreshes left today" UI indicator
- [ ] Monitor for abuse patterns

---

**Want me to start with Phase 1 (backend limits)?** This is CRITICAL to stop losing money! 💸
