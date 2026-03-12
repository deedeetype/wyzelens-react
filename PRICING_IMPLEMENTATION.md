# WyzeLens Pricing Implementation - Scenario B (Aggressive + 20% Launch Discount)

## 🎯 FINAL PRICING TABLE

| Plan | **Regular Price** | **Launch Price (-20%)** | Profiles | Max Comp | Manual/day | Auto | Worst Cost | Profit (Worst) |
|------|------------------|------------------------|----------|----------|------------|------|------------|----------------|
| **Free** | $0 | $0 | 1 | 5 | 1 | None | $1.52 | -$1.52 |
| **Starter** | **$49** | **$39** 🚀 | 3 | 10 | 3 | Weekly | $15.51 | **+$23.49** ✅ |
| **Pro** | **$99** | **$79** 🚀 | 5 | **15** | 6 | Daily | $66.01 | **+$12.99** ✅ |
| **Business** | **$149** | **$119** 🚀 | 10 | **20** | 12 | Every 6h | $117.70 | **+$1.30** ✅ |
| **Enterprise** | **Contact Sales** | **Contact Sales** | Custom | Custom | Custom | Custom | - | - |

---

## 📋 CHANGES TO IMPLEMENT

### 1. Backend Limits (netlify/functions/)

#### A. Manual Refresh Hard Caps
**File:** `refresh-scan.mts` (already has daily limit check)

**Update limits:**
```typescript
const dailyRefreshLimits: Record<string, number> = {
  free: 1,
  starter: 3,
  pro: 6,        // was: 999 (unlimited) ❌
  business: 12,  // was: 999 (unlimited) ❌
  enterprise: 999
}
```

#### B. Competitor Limits
**File:** `scan-step.mts` (stepInit function)

**Update maxCompetitors:**
```typescript
const competitorLimits: Record<string, number> = {
  free: 5,
  starter: 10,
  pro: 15,      // was: 15 ✅ (no change)
  business: 20, // was: unlimited ❌
  enterprise: 50
}
```

#### C. Auto-Refresh Frequencies
**File:** `run-scheduled-scans.mts`

**Update intervals:**
```typescript
const autoRefreshConfig = {
  free: null,         // No auto ✅
  starter: 'weekly',  // was: daily ❌
  pro: 'daily',       // was: hourly ❌
  business: '6h',     // was: hourly ❌
  enterprise: 'hourly' // ✅
}
```

---

### 2. Frontend Pricing Page

#### A. Update Pricing.tsx

**Current (src/pages/Pricing.tsx):**
```typescript
const plans = [
  { name: 'Free', price: 0, ... },
  { name: 'Starter', price: 8, originalPrice: null, ... },
  { name: 'Pro', price: 20, originalPrice: null, ... },
  { name: 'Business', price: 49, originalPrice: null, ... }
]
```

**New:**
```typescript
const plans = [
  { 
    name: 'Free', 
    price: 0, 
    originalPrice: null,
    profiles: 1,
    competitors: 5,
    manualRefreshes: '1/day',
    autoRefresh: 'None',
    features: [...]
  },
  { 
    name: 'Starter', 
    price: 39, 
    originalPrice: 49,  // ✅ Show strikethrough
    badge: '🚀 LAUNCH PRICE',
    profiles: 3,
    competitors: 10,
    manualRefreshes: '3/day',
    autoRefresh: 'Weekly',
    features: [
      '3 industry profiles',
      '10 competitors per profile',
      '3 manual refreshes/day',
      'Weekly auto-refresh',
      'Watchlist priority (Pro+)',
      '7-day history'
    ]
  },
  { 
    name: 'Pro', 
    price: 79, 
    originalPrice: 99,
    badge: '🚀 LAUNCH PRICE',
    profiles: 5,
    competitors: 15,
    manualRefreshes: '6/day',
    autoRefresh: 'Daily',
    features: [
      '5 industry profiles',
      '15 competitors per profile',
      '6 manual refreshes/day',
      'Daily auto-refresh',
      'Watchlist priority',
      'Regional filters',
      '30-day history'
    ]
  },
  { 
    name: 'Business', 
    price: 119, 
    originalPrice: 149,
    badge: '🚀 LAUNCH PRICE',
    profiles: 10,
    competitors: 20,
    manualRefreshes: '12/day',
    autoRefresh: 'Every 6 hours',
    features: [
      '10 industry profiles',
      '20 competitors per profile',
      '12 manual refreshes/day',
      'Every 6-hour auto-refresh',
      'Watchlist priority',
      'Regional filters',
      '90-day history'
    ]
  },
  { 
    name: 'Enterprise', 
    price: null,
    displayPrice: 'Contact Sales',
    originalPrice: null,
    badge: 'CUSTOM',
    profiles: 'Custom',
    competitors: 'Custom',
    manualRefreshes: 'Custom',
    autoRefresh: 'Hourly + Custom',
    features: [
      'Unlimited profiles',
      'Custom competitor limits',
      'Custom refresh limits',
      'Hourly auto-refresh',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Unlimited history'
    ]
  }
]
```

---

### 3. Stripe Products

#### Create new price IDs in Stripe Dashboard:

**Starter:**
- Regular: $49/month (price_1xxx_starter_regular)
- Launch: $39/month (price_1xxx_starter_launch) ← Use this one

**Pro:**
- Regular: $99/month (price_1xxx_pro_regular)
- Launch: $79/month (price_1xxx_pro_launch) ← Use this one

**Business:**
- Regular: $149/month (price_1xxx_business_regular)
- Launch: $119/month (price_1xxx_business_launch) ← Use this one

---

### 4. Environment Variables

**Update .env:**
```bash
# OLD (delete these)
# VITE_STRIPE_PRICE_ID_STARTER=price_1T9T5w01YX9kum4ITE9KZu7M
# VITE_STRIPE_PRICE_ID_PRO=price_1T9T6g01YX9kum4IvuUKQBO0
# VITE_STRIPE_PRICE_ID_BUSINESS=price_1T9T7q01YX9kum4Itdj8MBrS

# NEW (launch pricing with 20% discount)
VITE_STRIPE_PRICE_ID_STARTER=price_1xxx_starter_launch  # $39 (was $49)
VITE_STRIPE_PRICE_ID_PRO=price_1xxx_pro_launch          # $79 (was $99)
VITE_STRIPE_PRICE_ID_BUSINESS=price_1xxx_business_launch # $119 (was $149)
```

---

## 📊 FINAL SUMMARY TABLE (What You're Implementing)

### With 20% Launch Discount:

| Plan | **Regular** | **Launch (-20%)** | Profiles | **Max Comp** | Manual/day | Auto | Worst Cost | Profit (Worst) |
|------|------------|------------------|----------|--------------|------------|------|------------|----------------|
| Free | $0 | $0 | 1 | 5 | 1 | None | $1.52 | -$1.52 |
| Starter | ~~$49~~ | **$39** 🚀 | 3 | 10 | 3 | Weekly | $15.51 | **+$23.49** ✅ |
| Pro | ~~$99~~ | **$79** 🚀 | 5 | **15** ⭐ | 6 | Daily | $66.01 | **+$12.99** ✅ |
| Business | ~~$149~~ | **$119** 🚀 | 10 | **20** ⭐ | 12 | Every 6h | $117.70 | **+$1.30** ✅ |
| Enterprise | - | **Contact Sales** | Custom | Custom | Custom | Custom | - | - |

⭐ = Changed from your request (Pro: 15 instead of 20, Business: 20 instead of unlimited)

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Backend Limits (CRITICAL - Stop the bleeding!)
- [ ] Update refresh-scan.mts: Manual limits (1/3/6/12/999)
- [ ] Update scan-step.mts: Competitor limits (5/10/15/20/50)
- [ ] Update run-scheduled-scans.mts: Auto-refresh (none/weekly/daily/6h/hourly)
- [ ] Test limits enforce correctly
- [ ] Deploy immediately

### Step 2: Stripe Products (30 min)
- [ ] Create new products in Stripe Dashboard:
  - Starter Regular: $49/month
  - Starter Launch: $39/month ← Use this
  - Pro Regular: $99/month
  - Pro Launch: $79/month ← Use this
  - Business Regular: $149/month
  - Business Launch: $119/month ← Use this
- [ ] Copy new price IDs
- [ ] Update .env + Netlify env vars

### Step 3: Frontend Pricing (30 min)
- [ ] Update Pricing.tsx with new prices + strikethrough
- [ ] Add "🚀 SPECIAL LAUNCH PRICE" badges
- [ ] Update feature lists (competitors, refresh limits)
- [ ] Test checkout flow (all 3 plans)

### Step 4: Deploy & Monitor
- [ ] Git commit + push
- [ ] Netlify deploy
- [ ] Test full flow (signup → checkout → dashboard limits)
- [ ] Monitor Stripe webhooks

### Step 5: Grandfather Existing Users (Email)
- [ ] Draft email: "Pricing update in 30 days, current rate locked 6 months"
- [ ] Send to existing paid subscribers
- [ ] Add notice in dashboard

---

## ⚠️ YOUR ADJUSTMENTS (from original Scenario B)

| Item | Scenario B Original | Your Request | Reason |
|------|---------------------|--------------|--------|
| Pro competitors | 20 | **15** ⭐ | More conservative (lower cost) |
| Business competitors | 30 | **20** ⭐ | Prevent high worst-case cost |
| Enterprise | $799 | **Contact Sales** | Custom pricing negotiation |

**Impact of your changes:**
- Pro worst cost: $82.51 → **$66.01** (saves $16.50) ✅
- Business worst cost: $192.45 → **$117.70** (saves $74.75) ✅
- Better safety margins! 👍

---

## 🎯 READY TO IMPLEMENT?

**I will:**
1. ✅ Update backend limits (manual refresh caps, competitor caps, auto-refresh intervals)
2. ✅ Update Pricing.tsx (show $49→$39, $99→$79, $149→$119 with strikethrough)
3. ✅ Keep Enterprise as "Contact Sales"
4. ✅ Pro max competitors: 15 (not 20)
5. ✅ Business max competitors: 20 (not 30)
6. ✅ Test build passes
7. ✅ Push to GitHub

**Stripe products:** You'll need to create these manually (I'll give you the exact specs)

---

**Confirm to proceed?** 🚀
