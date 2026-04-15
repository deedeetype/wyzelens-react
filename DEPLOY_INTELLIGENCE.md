# WyzeLens v2.0.0 - Competitor Intelligence Deployment Guide

**Release:** v2.0.0-competitor-intelligence  
**Commit:** 7b5c44b  
**Date:** April 14, 2026

---

## 🎯 What's New

**Competitor Intelligence with FireCrawl:**
- Deep web scraping for competitor insights
- Automated data extraction (company info, social media, hiring, news)
- Visual homepage screenshots
- Growth tracking via open positions
- Social media presence monitoring

**User Experience:**
1. Click competitor → Expand panel
2. Click "Intelligence" tab → See enriched data OR "Enrich" button
3. Click "Enrich" → FireCrawl scrapes website (~60 sec)
4. View collapsible sections:
   - Overview (screenshot, HQ, locations)
   - Company Info (history, mission)
   - Products & Services
   - Social Media (LinkedIn, Twitter, etc.)
   - Hiring Activity (open positions)
   - News & Blog

---

## ✅ Pre-Deployment Checklist

### 1. Supabase Migration (ALREADY DONE ✓)
The `competitor_intelligence` table has been created in Supabase.

**Verify:**
```sql
SELECT COUNT(*) FROM competitor_intelligence;
-- Should return 0 (empty table, ready for data)
```

### 2. Netlify Environment Variables

**Required:**
- `FIRECRAWL_API_KEY=fc-1b87aaf94bb74139aff5785c73a0e779`

**Already configured (verify):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Steps:**
1. Go to: https://app.netlify.com/sites/wyzelens/settings/env
2. Add `FIRECRAWL_API_KEY` if not present
3. Click "Save"
4. Trigger redeploy (or wait for auto-deploy from push)

---

## 🚀 Deployment Process

### Auto-Deploy (Recommended)
Netlify will auto-deploy from `main` branch:
1. ✅ Code pushed to GitHub
2. ⏳ Netlify detects changes → Build starts
3. ⏳ Build completes (2-3 min)
4. ✅ Deploy live to https://wyzelens.com

**Monitor deployment:**
https://app.netlify.com/sites/wyzelens/deploys

### Manual Trigger (if needed)
1. Go to: https://app.netlify.com/sites/wyzelens/deploys
2. Click "Trigger deploy" → "Deploy site"

---

## 🧪 Post-Deployment Testing

### 1. Verify Function Deployment
Check that `enrich-competitor` function is live:
```bash
curl -X POST https://wyzelens.com/.netlify/functions/enrich-competitor \
  -H "Content-Type: application/json" \
  -d '{"competitorId":"test","userId":"test"}' 
```

Expected: 404 or 400 error (not 502/timeout) = function exists

### 2. Test Enrichment Flow (Live)
1. Login to WyzeLens
2. Go to Dashboard → Competitors tab
3. Click any competitor with a `domain`
4. Click "Intelligence" tab
5. Click "Enrich Competitor" button
6. Wait ~60 seconds
7. Page should reload with intelligence data
8. Verify sections populate:
   - Overview (screenshot visible?)
   - Company Info (history/mission?)
   - Social Media (links work?)
   - Hiring (positions count?)

### 3. Test Re-Enrichment
1. On same competitor, click "Refresh" button
2. Wait ~60 seconds
3. Page reloads with updated data
4. Check `last_enriched_at` timestamp updated

### 4. Verify Database
Check Supabase:
```sql
SELECT 
  competitor_id,
  homepage_title,
  social_linkedin,
  open_positions_count,
  last_enriched_at
FROM competitor_intelligence
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 Expected Costs

### FireCrawl Usage
**Per Enrichment (single competitor):**
- Homepage scrape: 1 credit
- About page scrape: 1 credit
- Careers page scrape: 1 credit
- **Total: ~3 credits per competitor**

**FireCrawl Plan:**
- Hobby: $16/month (3,000 credits) = ~1,000 competitor enrichments/month
- Standard: $83/month (100,000 credits) = ~33,000 enrichments/month

**Projected Usage (conservative):**
- 10 users × 10 competitors × 4 enrichments/month = 400 enrichments/month
- **400 enrichments × 3 credits = 1,200 credits/month**
- **Cost: ~$16/month (Hobby plan sufficient)**

---

## 🐛 Troubleshooting

### Issue: "Failed to enrich competitor"
**Possible causes:**
1. Competitor has no `domain` field
2. Domain SSL broken (rare)
3. FireCrawl API timeout (>120 sec)
4. FireCrawl rate limit hit

**Fix:**
- Check competitor.domain in DB (not null?)
- Try different competitor
- Wait 5 min and retry (rate limit)

### Issue: Intelligence tab shows loading forever
**Cause:** Supabase RLS policy blocking read

**Fix:**
```sql
-- Verify user can read their own intelligence
SELECT * FROM competitor_intelligence WHERE user_id = 'user_xxx';
```

### Issue: Screenshot not displaying
**Cause:** FireCrawl screenshot URL expired (24h TTL)

**Fix:**
- Click "Refresh" to re-scrape and get new screenshot

### Issue: Function timeout
**Cause:** FireCrawl taking >10 seconds (Netlify default timeout)

**Fix:**
Already handled - Netlify Functions have 10s default, but FireCrawl typically completes in 30-60s. If issues persist, consider:
1. Background job processing
2. Queue-based enrichment
3. Webhook callbacks

---

## 🔄 Rollback Plan

### If deployment breaks production:

**Option 1: Revert to previous tag**
```bash
git checkout 0a3c439  # Previous commit (landing typo fix)
git push origin main --force
```

**Option 2: Use previous stable tag**
```bash
git checkout v1.6.0-trial-complete
git push origin main --force
```

**Option 3: Disable Intelligence tab only**
Comment out in `CompetitorsView.tsx`:
```tsx
// <button onClick={() => setActiveTab('intelligence')}>
//   Intelligence
// </button>
```

---

## 📝 Post-Launch Monitoring

### Week 1: Monitor
- FireCrawl credit usage (dashboard: https://firecrawl.dev/dashboard)
- Enrichment success rate (check logs)
- User feedback on intelligence quality
- Supabase storage growth (screenshots + data)

### Week 2: Optimize
- Add caching for recently enriched competitors
- Consider scheduled background enrichment (weekly)
- Add more structured schemas (pricing pages, patents, etc.)

---

## 🎉 Success Metrics

**Day 1:**
- [ ] 10+ competitors enriched successfully
- [ ] No critical errors in Netlify logs
- [ ] FireCrawl credits used < 100

**Week 1:**
- [ ] 50+ competitors enriched
- [ ] Average enrichment time < 90 seconds
- [ ] User feedback positive (valuable insights)

**Month 1:**
- [ ] 500+ enrichments total
- [ ] Conversion: Intelligence users → paid plans
- [ ] Feature requests for additional data sources

---

## 📞 Support

**FireCrawl Issues:**
- Dashboard: https://firecrawl.dev/dashboard
- Docs: https://docs.firecrawl.dev
- Support: help@firecrawl.com

**Deployment Issues:**
- Netlify Dashboard: https://app.netlify.com/sites/wyzelens
- Logs: https://app.netlify.com/sites/wyzelens/logs

**Database Issues:**
- Supabase: https://supabase.com/dashboard/project/erkzlqgpbrxokyqtrgnf

---

**Deployed by:** Sully 🦝  
**Tag:** v2.0.0-competitor-intelligence  
**Status:** 🚀 Ready for production
