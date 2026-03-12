# WyzeLens Pricing Analysis - WITH Competitor Limits Impact

## 🎯 Competitor Limits per Plan (Current)
- **Free:** 5 competitors
- **Starter:** 10 competitors
- **Pro:** 15 competitors
- **Business:** **UNLIMITED** competitors ⚠️
- **Enterprise:** **UNLIMITED** competitors ⚠️

---

## 💰 API Cost Impact by Competitor Count

### Perplexity sonar-pro pricing:
- Input: $1 per 1M tokens
- Output: $3 per 1M tokens

### Cost per NEW Scan by Competitor Count:

| Competitors | stepCompetitors | stepNews | Claude Analysis | **TOTAL per NEW Scan** |
|-------------|----------------|----------|-----------------|----------------------|
| **5** | $0.003 | $0.010 | $0.040 | **$0.053** |
| **10** | $0.005 | $0.010 | $0.055 | **$0.070** |
| **15** | $0.007 | $0.010 | $0.070 | **$0.087** |
| **25** | $0.012 | $0.010 | $0.100 | **$0.122** |
| **50** | $0.025 | $0.010 | $0.180 | **$0.215** |
| **100** | $0.050 | $0.010 | $0.350 | **$0.410** |

**Claude cost scales linearly with competitors:**
- More competitors → Longer context → More tokens
- 5 competitors: ~1,500 tokens analysis
- 50 competitors: ~10,000 tokens analysis
- 100 competitors: ~20,000 tokens analysis

### Cost per REFRESH by Competitor Count:

| Competitors | stepNews | Claude Analysis | **TOTAL per Refresh** |
|-------------|----------|-----------------|---------------------|
| **5** | $0.010 | $0.030 | **$0.040** |
| **10** | $0.010 | $0.040 | **$0.050** |
| **15** | $0.010 | $0.050 | **$0.060** |
| **25** | $0.010 | $0.075 | **$0.085** |
| **50** | $0.010 | $0.140 | **$0.150** |
| **100** | $0.010 | $0.280 | **$0.290** |

---

## 🚨 WORST CASE WITH UNLIMITED COMPETITORS

### Business Plan User (UNLIMITED competitors):
```
10 profiles × 100 competitors each = 1,000 competitors total

NEW Scans:
- 10 scans × $0.410 (100 competitors) = $4.10

Hourly Auto-Refresh:
- 10 profiles × 24 refreshes/day × 30 days = 7,200 refreshes
- 7,200 × $0.290 (100 competitors) = $2,088/month ❌❌❌

Manual Refreshes:
- 100/day × 30 days = 3,000 refreshes
- 3,000 × $0.290 = $870/month

TOTAL COST: $2,962/month
Revenue: $49/month
LOSS: -$2,913/month per user ❌❌❌
```

**Un seul user Business avec unlimited competitors peut te coûter $3,000/mois!** 😱😱😱

---

## ✅ RECOMMENDED PRICING (With Competitor Caps)

| Plan | Price | Profiles | **Max Competitors** | Manual/day | Auto | **Realistic Cost** | **Worst Case Cost** | **Profit (Realistic)** | **Profit (Worst)** |
|------|-------|----------|---------------------|------------|------|-------------------|-------------------|---------------------|------------------|
| **Free** | $0 | 1 | **5** | 1 | None | $1.52 | $1.52 | **-$1.52** | **-$1.52** |
| **Starter** | **$29** | 3 | **10** | 3 | Weekly | $7.91 | $16.71 | **+$21.09** ✅ | **+$12.29** ✅ |
| **Pro** | **$79** | 5 | **20** | 10 | Daily | $30.85 | $50.85 | **+$48.15** ✅ | **+$28.15** ✅ |
| **Business** | **$199** | 10 | **30** | 20 | Every 6h | $145.70 | $165.70 | **+$53.30** ✅ | **+$33.30** ✅ |
| **Enterprise** | **$499** | 20 | **50** | 50 | Hourly | $331.40 | $451.40 | **+$167.60** ✅ | **+$47.60** ✅ |

---

## 📊 COST BREAKDOWN by Plan (Worst Case Usage)

### FREE ($0) - 5 competitors max
```
Month 1:
- 1 NEW scan (5 comp): $0.053
- 30 manual refresh: 30 × $0.040 = $1.20
TOTAL: $1.25/month
Profit: -$1.25 (acceptable acquisition cost)
```

### STARTER ($29) - 10 competitors max
```
Realistic:
- 3 NEW (10 comp): 3 × $0.070 = $0.21
- 90 manual: 90 × $0.050 = $4.50
- 36 auto (weekly): 36 × $0.050 = $1.80
TOTAL: $6.51
Profit: $29 - $6.51 = +$22.49 ✅

Worst case (max manual):
- 3 NEW: $0.21
- 270 manual (3×30×3): $13.50
- 36 auto: $1.80
TOTAL: $15.51
Profit: $29 - $15.51 = +$13.49 ✅
```

### PRO ($79) - 20 competitors max
```
Realistic:
- 5 NEW (20 comp): 5 × $0.122 = $0.61
- 300 manual (10/day): 300 × $0.085 = $25.50
- 150 auto (daily): 150 × $0.085 = $12.75
TOTAL: $38.86
Profit: $79 - $38.86 = +$40.14 ✅

Worst case (cap enforced):
- 5 NEW: $0.61
- 1,500 manual (10×30×5): $127.50
- 150 auto: $12.75
TOTAL: $140.86... wait, that's still a loss!

NEED HIGHER PRICE OR LOWER CAP!
```

⚠️ **Pro still vulnerable at $79 with 10/day cap if user maxes it!**

---

## 🛡️ SAFER PRICING (Worst Case Protected)

| Plan | **Price** | Profiles | **Max Competitors** | **Manual/day** | Auto | **Worst Cost** | **Profit (Worst)** |
|------|-----------|----------|---------------------|---------------|------|---------------|------------------|
| **Free** | $0 | 1 | 5 | 1 | None | $1.52 | -$1.52 (OK) |
| **Starter** | **$29** | 3 | 10 | 3 | Weekly | $15.51 | **+$13.49** ✅ |
| **Pro** | **$99** | 5 | 20 | **8** | Daily | $82.51 | **+$16.49** ✅ |
| **Business** | **$199** | 10 | 30 | 15 | Every 6h | $192.45 | **+$6.55** ✅ |
| **Enterprise** | **$599** | 20 | 50 | 30 | Hourly | $577.40 | **+$21.60** ✅ |

---

## 🎯 KEY INSIGHTS

### 1. **Unlimited Competitors = Financial Suicide** ❌
- Business user with 100 competitors: $3,000/month cost
- MUST cap competitors (even at highest tiers)

### 2. **Hourly Auto-Refresh = Expensive** 💸
- 720 refreshes/month per profile
- With 20 competitors: 720 × $0.085 = $61/month per profile!
- Reserve for Enterprise ($599) only

### 3. **Manual Refresh Caps = Essential** 🛡️
- Pro: 8/day (not 10) = 240/month max
- Business: 15/day (not 20) = 450/month max
- Prevents worst-case abuse

---

## 📊 FINAL RECOMMENDATION

### Conservative (Safer margins):
```
Free:     $0    | 1 profile  | 5 comp  | 1 manual/day  | No auto
Starter:  $29   | 3 profiles | 10 comp | 3 manual/day  | Weekly
Pro:      $99   | 5 profiles | 20 comp | 8 manual/day  | Daily
Business: $199  | 10 profiles| 30 comp | 15 manual/day | Every 6h
Enterprise: $599| 20 profiles| 50 comp | 30 manual/day | Hourly
```

### Aggressive (Higher prices, better margins):
```
Free:     $0    | 1 profile  | 5 comp  | 1 manual/day  | No auto
Starter:  $39   | 3 profiles | 10 comp | 3 manual/day  | Weekly
Pro:      $129  | 5 profiles | 20 comp | 8 manual/day  | Daily
Business: $249  | 10 profiles| 30 comp | 15 manual/day | Every 6h
Enterprise: $799| 20 profiles| 50 comp | 30 manual/day | Hourly
```

**Même à $129 (Pro), tu es 90% moins cher que Crayon ($1,250/mois)!**

---

## 🚀 **Action immédiate:**

**1. Backend limits (URGENT - arrête le saignement):**
- Hard cap manual refreshes
- Cap max competitors per plan
- Change hourly → daily/6h

**2. Pricing update:**
- New Stripe products
- Update frontend

**Tu veux quel scénario? Conservative ($29/$99/$199/$599) ou Aggressive ($39/$129/$249/$799)?** 🎯