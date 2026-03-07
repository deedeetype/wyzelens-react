# WyzeLens Supabase Database Schema

**Last updated:** March 7, 2026 (00:39 EST)

**CRITICAL:** Always consult this file before writing Supabase queries!

---

## 📋 Table: `scans`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | YES | Clerk user ID |
| `industry` | text | NO | Industry name |
| `status` | text | NO | 'pending', 'processing', 'completed', 'failed' |
| `error_message` | text | YES | Error details if failed |
| `competitors_count` | integer | YES | Total competitors found |
| `alerts_count` | integer | YES | Total alerts |
| `insights_count` | integer | YES | Total insights |
| `news_count` | integer | YES | Total news items |
| `created_at` | timestamptz | YES | Scan creation time |
| `completed_at` | timestamptz | YES | Scan completion time |
| `duration_seconds` | integer | YES | Total scan duration |
| `industry_analytics` | jsonb | YES | Market analytics JSON |
| `company_url` | text | YES | User's company URL |
| `company_name` | text | YES | User's company name |
| `last_refreshed_at` | timestamptz | YES | Last refresh timestamp |
| `refresh_count` | integer | YES | Number of refreshes |
| `updated_at` | timestamptz | YES | Last update time |
| `old_user_id` | text | YES | Legacy field |

**Key queries:**
```sql
-- Get active scan for user
SELECT * FROM scans WHERE user_id = '...' AND status = 'completed' ORDER BY created_at DESC LIMIT 1

-- Update scan status
UPDATE scans SET status = 'completed', completed_at = now() WHERE id = '...'
```

---

## 📋 Table: `user_subscriptions`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | NO | Clerk user ID |
| `plan` | text | NO | 'free', 'starter', 'pro', 'business', 'enterprise' |
| `stripe_customer_id` | text | YES | Stripe customer ID (cus_...) |
| `stripe_subscription_id` | text | YES | Stripe subscription ID (sub_...) |
| `status` | text | NO | 'active', 'cancelled', 'past_due', etc. |
| `current_period_start` | timestamp | YES | Billing period start (no timezone) |
| `current_period_end` | timestamp | YES | Billing period end (no timezone) |
| `cancel_at_period_end` | boolean | YES | If subscription will cancel |
| `created_at` | timestamp | YES | Subscription creation |
| `updated_at` | timestamp | YES | Last update |

**Key queries:**
```sql
-- Get user subscription
SELECT * FROM user_subscriptions WHERE user_id = '...'

-- Get Stripe customer ID for portal
SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = '...' AND status = 'active'
```

**⚠️ Important:** This table uses `timestamp` (NOT `timestamptz`) for period fields!

---

## 📋 Table: `competitors`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | NO | Clerk user ID |
| `scan_id` | uuid | YES | Parent scan |
| `name` | text | NO | Company name |
| `domain` | text | YES | Company domain |
| `industry` | text | YES | Industry category |
| `threat_score` | numeric | YES | 0-10 threat level |
| `funding_amount` | bigint | YES | Funding in dollars |
| `funding_stage` | text | YES | Seed, Series A, etc. |
| `employee_count` | integer | YES | Number of employees |
| `description` | text | YES | Company description |
| `activity_level` | text | YES | 'low', 'medium', 'high' |
| `sentiment_score` | numeric | YES | 0-1 sentiment |
| `last_activity_date` | timestamptz | YES | Last activity |
| `stock_ticker` | text | YES | Stock symbol |
| `stock_price` | numeric | YES | Current price |
| `stock_currency` | text | YES | USD, EUR, etc. |
| `stock_change_percent` | numeric | YES | Daily change % |
| `archived` | boolean | YES | If archived |
| `created_at` | timestamptz | YES | Creation time |

**Key queries:**
```sql
-- Get competitors for a scan
SELECT * FROM competitors WHERE scan_id = '...' AND archived = false

-- Archive competitors
UPDATE competitors SET archived = true WHERE scan_id = '...'
```

---

## 📋 Table: `alerts`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | NO | Clerk user ID |
| `scan_id` | uuid | YES | Parent scan |
| `competitor_id` | uuid | YES | Related competitor |
| `title` | text | NO | Alert title |
| `description` | text | YES | Alert details |
| `priority` | text | NO | 'info', 'low', 'medium', 'high', 'critical' |
| `category` | text | YES | Alert category |
| `read` | boolean | YES | If user read it |
| `archived` | boolean | YES | If archived |
| `is_new` | boolean | YES | If from latest refresh |
| `added_at` | timestamptz | YES | When added |
| `created_at` | timestamptz | YES | Creation time |

**Key queries:**
```sql
-- Count new alerts for scan
SELECT COUNT(*) FROM alerts WHERE scan_id = '...' AND is_new = true

-- Mark all as not new
UPDATE alerts SET is_new = false WHERE scan_id = '...'

-- Get unread alerts
SELECT * FROM alerts WHERE user_id = '...' AND read = false AND archived = false
```

---

## 📋 Table: `insights`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | NO | Clerk user ID |
| `scan_id` | uuid | YES | Parent scan |
| `type` | text | NO | 'recommendation', 'trend', 'risk', etc. |
| `title` | text | NO | Insight title |
| `description` | text | NO | Insight details |
| `confidence` | numeric | YES | 0-1 confidence score |
| `impact` | text | YES | 'low', 'medium', 'high' |
| `action_items` | ARRAY | YES | List of action items |
| `archived` | boolean | YES | If archived |
| `is_new` | boolean | YES | If from latest refresh |
| `added_at` | timestamptz | YES | When added |
| `created_at` | timestamptz | YES | Creation time |

**Key queries:**
```sql
-- Count new insights
SELECT COUNT(*) FROM insights WHERE scan_id = '...' AND is_new = true

-- Mark all as not new
UPDATE insights SET is_new = false WHERE scan_id = '...'
```

---

## 📋 Table: `news_feed`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `user_id` | text | NO | Clerk user ID |
| `scan_id` | uuid | YES | Parent scan |
| `competitor_id` | uuid | YES | Related competitor |
| `title` | text | NO | News title |
| `summary` | text | YES | News summary |
| `source` | text | YES | Source name |
| `source_url` | text | YES | Article URL |
| `published_at` | timestamptz | YES | Article publication date |
| `relevance_score` | numeric | YES | 0-1 relevance |
| `sentiment` | text | YES | 'positive', 'neutral', 'negative' |
| `tags` | ARRAY | YES | Article tags |
| `archived` | boolean | YES | If archived |
| `is_new` | boolean | YES | If from latest refresh |
| `added_at` | timestamptz | YES | When added |
| `created_at` | timestamptz | YES | Creation time |

**Key queries:**
```sql
-- Count new news for scan
SELECT COUNT(*) FROM news_feed WHERE scan_id = '...' AND is_new = true

-- Check for duplicate URLs (last 24h)
SELECT source_url FROM news_feed 
WHERE user_id = '...' AND created_at >= now() - interval '24 hours'

-- Mark all as not new
UPDATE news_feed SET is_new = false WHERE scan_id = '...'
```

---

## 📋 Table: `refresh_logs`

**Primary key:** `id` (uuid)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | Primary key |
| `scan_id` | uuid | YES | Parent scan |
| `user_id` | text | YES | Clerk user ID |
| `industry` | text | YES | Industry refreshed |
| `triggered_by` | text | YES | 'manual', 'scheduled' |
| `started_at` | timestamptz | YES | Refresh start time |
| `completed_at` | timestamptz | YES | Refresh end time |
| `status` | text | YES | 'running', 'completed', 'failed' |
| `new_alerts_count` | integer | YES | New alerts added |
| `new_insights_count` | integer | YES | New insights added |
| `new_news_count` | integer | YES | New news added |
| `error_message` | text | YES | Error if failed |

**Key queries:**
```sql
-- Count manual refreshes today (UTC)
SELECT COUNT(*) FROM refresh_logs 
WHERE user_id = '...' 
  AND triggered_by = 'manual' 
  AND created_at >= date_trunc('day', now() at time zone 'UTC')

-- Get latest refresh for scan
SELECT * FROM refresh_logs WHERE scan_id = '...' ORDER BY started_at DESC LIMIT 1

-- Get activity log (last 7 days)
SELECT * FROM refresh_logs 
WHERE user_id = '...' 
  AND status = 'completed'
  AND completed_at >= now() - interval '7 days'
ORDER BY completed_at DESC
```

---

## 🔑 Common Patterns:

### Inserting with is_new flag:
```typescript
await supabasePost('alerts', items.map(item => ({
  ...item,
  is_new: true,
  added_at: new Date().toISOString()
})))
```

### Resetting is_new before refresh:
```typescript
await fetch(`${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}`, {
  method: 'PATCH',
  body: JSON.stringify({ is_new: false })
})
```

### Counting new items:
```typescript
const countRes = await fetch(
  `${SUPABASE_URL}/rest/v1/alerts?scan_id=eq.${scanId}&is_new=eq.true&select=id`,
  { headers: { ... } }
)
const count = (await countRes.json()).length
```

---

## ⚠️ Critical Notes:

1. **Table names:**
   - ✅ `user_subscriptions` (with 's')
   - ✅ `scans`, `alerts`, `insights`, `news_feed`, `refresh_logs`

2. **Status values:**
   - scans.status: 'pending', 'processing', 'completed', 'failed'
   - refresh_logs.status: 'running', 'completed', 'failed'
   - user_subscriptions.status: 'active', 'cancelled', 'past_due'

3. **Timestamp types:**
   - Most tables: `timestamptz` (with timezone)
   - user_subscriptions: `timestamp` (without timezone) for period fields

4. **user_id:**
   - All tables use `text` type (Clerk user ID format)
   - Format: `user_3AbNfK4UJ6von8VOJvLTNGYn5Rb`

---

**🦝 READ THIS FILE BEFORE ANY SUPABASE QUERY!**
