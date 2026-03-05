# WyzeLens Deployment & Configuration Reference

**Version:** v1.4.0-domain-migration  
**Date:** 2026-03-05  
**Domain:** https://wyzelens.com

---

## 🗄️ Database Schema (Supabase)

**Project ID:** `erkzlqgpbrxokyqtrgnf`  
**URL:** `https://erkzlqgpbrxokyqtrgnf.supabase.co`

### Core Tables

#### `users` table
```sql
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_clerk_id_key UNIQUE (clerk_id)
);

CREATE INDEX idx_users_clerk_id ON public.users USING btree (clerk_id);
```

**Important:** Foreign keys in related tables reference `users(clerk_id)` (TEXT), NOT `users(id)` (UUID)

#### Related Tables (with CASCADE DELETE on clerk_id)
- `scans` - Industry scans created by users
- `competitors` - Competitor data from scans
- `news_feed` - News articles related to industries
- `alerts` - User alerts and notifications
- `insights` - AI-generated insights
- `user_subscriptions` - Stripe subscription data
- `scan_schedules` - Automated scan schedules
- `usage_tracking` - User activity tracking
- `refresh_logs` - Scan refresh history

All related tables have foreign key constraints:
```sql
FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE
```

---

## 🔐 Environment Variables (Netlify)

**Location:** Site Settings > Environment Variables  
**Scopes:** Must have both "Production" and "Deploy previews" checked

### Supabase
```bash
VITE_SUPABASE_URL=https://erkzlqgpbrxokyqtrgnf.supabase.co
SUPABASE_SERVICE_KEY=eyJ...        # Used by scan-step.mts
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Used by clerk-webhook.mjs (same value as above)
```

**Note:** Both `SUPABASE_SERVICE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must exist with the same value (service_role key from Supabase)

### Clerk (Authentication)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Clerk Project:** quicky-hawk-34

**Webhook Configuration:**
- URL: `https://wyzelens.com/.netlify/functions/clerk-webhook`
- Events: `user.created`, `user.updated`, `user.deleted`
- Status: Active ✅

### Stripe (Payments)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Webhook URL:** `https://wyzelens.com/.netlify/functions/stripe-webhook`

### AI APIs
```bash
PERPLEXITY_API_KEY=pplx-...
POE_API_KEY=...
```

---

## 🔗 Service Configuration

### Clerk Dashboard Settings
1. **Configure > Paths**
   - Sign-in URL: `https://wyzelens.com/sign-in`
   - Sign-up URL: `https://wyzelens.com/sign-up`
   - Home URL: `https://wyzelens.com`
   - After sign-in: `https://wyzelens.com/dashboard`
   - After sign-up: `https://wyzelens.com/onboarding`

2. **Configure > Domains**
   - Authorized domain: `wyzelens.com`

3. **Configure > Webhooks**
   - Endpoint: `https://wyzelens.com/.netlify/functions/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted` ✅

### Supabase Dashboard Settings
1. **Authentication > URL Configuration**
   - Site URL: `https://wyzelens.com`
   - Redirect URLs: `https://wyzelens.com/**`

2. **Settings > API**
   - CORS origins: `*` (or specific domain if needed)

### Stripe Dashboard Settings
1. **Developers > Webhooks**
   - Endpoint URL: `https://wyzelens.com/.netlify/functions/stripe-webhook`

2. **Product Settings**
   - Success URL: `https://wyzelens.com/dashboard?success=true`
   - Cancel URL: `https://wyzelens.com/pricing`

---

## 🎨 Features

### Theme System
- **Dark Mode:** Default slate-900/950 palette
- **Light Mode Variants:**
  1. **Corporate Minimal** - Clean gray tones (Indigo accents)
  2. **Soft Tech** - Gentle blue-gray (Sky blue accents)
  3. **Premium Neutral** - Warm beige tones (Amber accents)

Theme selection saved in localStorage: `pulseintel_settings`

### Webhooks
- **clerk-webhook.mjs** - Handles user lifecycle (create/update/delete)
- **stripe-webhook.mts** - Handles subscription events
- **scan-step.mts** - Multi-step scan orchestration

---

## 🚀 Deployment

### Netlify Configuration
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`
- **Node bundler:** `esbuild`

### Git Tags
- **Latest stable:** `v1.4.0-domain-migration`
- **Previous:** `v1.3.0-react-production`

### Rollback Procedure
```bash
# View available tags
git tag -l

# Checkout stable version
git checkout v1.4.0-domain-migration

# Force push to main (if needed)
git push origin main --force

# Trigger Netlify redeploy
```

---

## ⚠️ Known Issues & Notes

### scan-step.mts
- Currently `.mts` (TypeScript module)
- May need conversion to `.mjs` for better Netlify Functions compatibility
- Uses `SUPABASE_SERVICE_KEY` env var

### Webhook Behavior
- Clerk sends both `user.created` AND `user.updated` on signup
- Current logic checks for existing user to prevent duplicates
- User deletion triggers CASCADE DELETE in all related tables

### Database Constraints
- `clerk_id` is the primary foreign key reference (TEXT type)
- `id` (UUID) is internal primary key only
- All user_id columns in related tables must be TEXT type

---

## 📝 Migration History

### v1.4.0 - Domain Migration (2026-03-05)
- Migrated from `wyzelensreact.netlify.app` to `wyzelens.com`
- Fixed Clerk webhook (.mts → .mjs conversion)
- Aligned webhook with actual `users` table schema
- Added user.deleted event handler
- Implemented CASCADE DELETE on all related tables
- Added 3 light theme variants

### v1.3.0 - React Production
- Initial React version deployment
- Replaced Next.js version

---

## 🦝 Maintenance

**For restore points:**
```bash
# Create new tag
git tag -a vX.X.X-description -m "Release notes"
git push origin vX.X.X-description

# List all restore points
git tag -l -n1
```

**For emergency rollback:**
1. Checkout previous stable tag
2. Push to main (may need --force)
3. Verify in Netlify deploy logs
4. Test all webhooks (Clerk + Stripe)
5. Verify database connections

**Contact:** David (david.laborieux@gmail.com)

---

_Last updated: 2026-03-05 by Sully 🦝_
