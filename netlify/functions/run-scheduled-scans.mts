import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  // Get environment variables inside handler
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const CRON_SECRET = process.env.CRON_SECRET;

  console.log('[Cron] Environment check:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_KEY,
    hasSecret: !!CRON_SECRET,
  });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[Cron] Missing Supabase credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  // Create Supabase client inside handler
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Verify the request is authorized
  const authHeader = event.headers.authorization;
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[Cron] Unauthorized request');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    console.log('[Cron] Starting plan-based auto-refresh check...');
    
    const now = new Date();
    const isDailyWindow = now.getUTCHours() === 0; // Every day midnight UTC
    
    console.log(`[Cron] Current time: ${now.toISOString()} (UTC day ${now.getUTCDay()}, hour ${now.getUTCHours()})`);
    console.log(`[Cron] Daily window: ${isDailyWindow}`);
    
    // Fetch all completed scans
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('id, user_id, industry, company_name, company_url, last_refreshed_at')
      .eq('status', 'completed');
    
    if (scansError) {
      console.error('[Cron] Error fetching scans:', scansError);
      throw scansError;
    }
    
    console.log(`[Cron] Found ${scans?.length || 0} completed scans`);
    
    // Fetch all user subscriptions (we'll match in-memory)
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan');
    
    if (subsError) {
      console.error('[Cron] Error fetching subscriptions:', subsError);
      throw subsError;
    }
    
    // Create a map: userId → plan
    const userPlanMap = new Map<string, string>();
    for (const sub of subscriptions || []) {
      userPlanMap.set(sub.user_id, sub.plan);
    }
    
    const scansToRefresh: any[] = [];
    
    // Determine which scans to refresh based on plan + last refresh time
    for (const scan of scans || []) {
      const plan = userPlanMap.get(scan.user_id) || 'free';
      const lastRefresh = scan.last_refreshed_at ? new Date(scan.last_refreshed_at) : null;
      const hoursSinceRefresh = lastRefresh ? (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60) : 9999;
      
      let shouldRefresh = false;
      let reason = '';
      
      // Plan-based refresh logic
      switch (plan) {
        case 'free':
          // FREE plan has NO automated refresh
          // Users must use manual refresh (1/day limit enforced in UI/API)
          // Do not auto-refresh free scans
          break;
        
        case 'starter':
          // Daily: Every day midnight UTC (if >23 hours since last refresh)
          if (isDailyWindow && hoursSinceRefresh >= 23) {
            shouldRefresh = true;
            reason = 'daily (starter plan)';
          }
          break;
        
        case 'pro':
        case 'business':
        case 'enterprise':
          // Hourly: Every hour (if >0.98 hours since last refresh)
          if (hoursSinceRefresh >= 0.98) {
            shouldRefresh = true;
            reason = `hourly (${plan} plan)`;
          }
          break;
        
        default:
          // Unknown plan: treat as FREE (no auto-refresh)
          console.warn(`[Cron] Unknown plan "${plan}" for scan ${scan.id}, treating as free (no auto-refresh)`);
          break;
      }
      
      if (shouldRefresh) {
        console.log(`[Cron] Scan ${scan.id} (${plan}) is due: ${reason} (last refresh: ${hoursSinceRefresh.toFixed(1)}h ago)`);
        scansToRefresh.push({ scan, reason });
      }
    }
    
    console.log(`[Cron] ${scansToRefresh.length} scans to refresh`);
    
    // Execute refreshes
    const results = [];
    for (const { scan, reason } of scansToRefresh) {
      const scanStartTime = Date.now();
      const SCAN_TIMEOUT_MS = 9 * 60 * 1000; // 9 minutes
      
      try {
        console.log(`[Cron] Refreshing scan ${scan.id} (${reason})`);
        
        // ✅ NEW: Call dedicated refresh-scan endpoint
        const refreshResponse = await fetch(`${process.env.URL}/.netlify/functions/refresh-scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanId: scan.id,
            userId: scan.user_id,
            triggeredBy: 'scheduled'
          })
        });
        
        const refreshResult = await refreshResponse.json();
        
        if (!refreshResult.success) {
          throw new Error(refreshResult.error || 'Refresh failed');
        }
        
        const counts = refreshResult.counts || { alerts: 0, insights: 0, news: 0 };
        
        console.log(`[Cron] ${scan.id} - Refresh completed: ${counts.alerts} alerts, ${counts.insights} insights, ${counts.news} news`);
        
        results.push({
          scanId: scan.id,
          status: 'completed',
          reason,
          message: 'Refresh completed',
          counts
        });
        
      } catch (error: any) {
        console.error(`[Cron] Error refreshing scan ${scan.id}:`, error);
        
        results.push({
          scanId: scan.id,
          status: 'error',
          reason,
          message: error.message
        });
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        scansChecked: scans?.length || 0,
        scansRefreshed: scansToRefresh.length,
        results
      })
    };
    
  } catch (error: any) {
    console.error('[Cron] Fatal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
