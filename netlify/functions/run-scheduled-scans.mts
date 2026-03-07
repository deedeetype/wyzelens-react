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
    const isWeeklyWindow = now.getUTCDay() === 0 && now.getUTCHours() === 0; // Sunday midnight UTC
    const isDailyWindow = now.getUTCHours() === 0; // Every day midnight UTC
    
    console.log(`[Cron] Current time: ${now.toISOString()} (UTC day ${now.getUTCDay()}, hour ${now.getUTCHours()})`);
    console.log(`[Cron] Windows: weekly=${isWeeklyWindow}, daily=${isDailyWindow}`);
    
    // Fetch all completed scans with user subscription data
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select(`
        id,
        user_id,
        industry,
        company_name,
        company_url,
        last_refreshed_at,
        user_subscriptions!inner (
          plan
        )
      `)
      .eq('status', 'completed');
    
    if (scansError) {
      console.error('[Cron] Error fetching scans:', scansError);
      throw scansError;
    }
    
    console.log(`[Cron] Found ${scans?.length || 0} completed scans`);
    
    const scansToRefresh: any[] = [];
    
    // Determine which scans to refresh based on plan + last refresh time
    for (const scan of scans || []) {
      const plan = scan.user_subscriptions?.plan || 'free';
      const lastRefresh = scan.last_refreshed_at ? new Date(scan.last_refreshed_at) : null;
      const hoursSinceRefresh = lastRefresh ? (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60) : 9999;
      
      let shouldRefresh = false;
      let reason = '';
      
      // Plan-based refresh logic
      switch (plan) {
        case 'free':
          // Weekly: Sunday midnight UTC (if >6.5 days since last refresh)
          if (isWeeklyWindow && hoursSinceRefresh >= 156) {
            shouldRefresh = true;
            reason = 'weekly (free plan)';
          }
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
          console.warn(`[Cron] Unknown plan "${plan}" for scan ${scan.id}, treating as free`);
          if (isWeeklyWindow && hoursSinceRefresh >= 156) {
            shouldRefresh = true;
            reason = 'weekly (unknown plan, default to free)';
          }
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
      
      let refreshLogId: number | undefined;
      let actualScanId: string | undefined;
      
      try {
        console.log(`[Cron] Refreshing scan ${scan.id} (${reason})`);
        
        // Step 1: Init (refresh mode)
        const step1Response = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'init',
            industry: scan.industry,
            companyUrl: scan.company_url,
            companyName: scan.company_name,
            userId: scan.user_id,
            isScheduled: true,
            isRefresh: true
          })
        });
        
        const step1Result = await step1Response.json();
        
        if (!step1Result.success) {
          throw new Error(`Init failed: ${step1Result.error || 'Unknown error'}`);
        }
        
        actualScanId = step1Result.scanId;
        console.log(`[Cron] ${scan.id} - Init complete, scanId: ${actualScanId}`);
        
        // Log refresh start
        const { data: logData, error: logError } = await supabase
          .from('refresh_logs')
          .insert({
            scan_id: actualScanId,
            user_id: scan.user_id,
            industry: scan.industry,
            status: 'running',
            triggered_by: 'scheduled',
            started_at: now.toISOString()
          })
          .select('id')
          .single();
        
        if (logError) {
          console.error(`[Cron] Failed to create refresh_log:`, logError);
        }
        
        refreshLogId = logData?.id;
        
        // Check timeout
        if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
          throw new Error('Timeout before news step');
        }
        
        // Step 2: News
        console.log(`[Cron] ${actualScanId} - Fetching news`);
        const newsResponse = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'news',
            scanId: actualScanId,
            industry: scan.industry,
            userId: scan.user_id
          })
        });
        
        const newsResult = await newsResponse.json();
        if (!newsResult.success) {
          throw new Error(`News fetch failed: ${newsResult.error || 'Unknown error'}`);
        }
        console.log(`[Cron] ${actualScanId} - News fetched`);
        
        // Check timeout
        if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
          throw new Error('Timeout before analyze step');
        }
        
        // Step 3: Analyze
        console.log(`[Cron] ${actualScanId} - Analyzing`);
        const analyzeResponse = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'analyze',
            scanId: actualScanId,
            industry: scan.industry,
            userId: scan.user_id,
            news: newsResult.news || [],
            isRefresh: true
          })
        });
        
        const analyzeResult = await analyzeResponse.json();
        if (!analyzeResult.success) {
          throw new Error(`Analysis failed: ${analyzeResult.error || 'Unknown error'}`);
        }
        console.log(`[Cron] ${actualScanId} - Analysis complete`);
        
        // Mark scan as completed
        await supabase
          .from('scans')
          .update({ status: 'completed', updated_at: now.toISOString() })
          .eq('id', actualScanId);
        
        // Count new items
        const { count: newsCount } = await supabase
          .from('news_feed')
          .select('*', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        const { count: insightsCount } = await supabase
          .from('insights')
          .select('*', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        const { count: alertsCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        console.log(`[Cron] ${actualScanId} - New items: ${insightsCount || 0} insights, ${alertsCount || 0} alerts, ${newsCount || 0} news`);
        
        // Update refresh log
        const completedAt = new Date().toISOString();
        if (refreshLogId) {
          await supabase
            .from('refresh_logs')
            .update({
              status: 'completed',
              new_alerts_count: alertsCount || 0,
              new_insights_count: insightsCount || 0,
              new_news_count: newsCount || 0,
              completed_at: completedAt
            })
            .eq('id', refreshLogId);
        } else if (actualScanId) {
          await supabase
            .from('refresh_logs')
            .update({
              status: 'completed',
              new_alerts_count: alertsCount || 0,
              new_insights_count: insightsCount || 0,
              new_news_count: newsCount || 0,
              completed_at: completedAt
            })
            .eq('scan_id', actualScanId)
            .eq('status', 'running')
            .order('started_at', { ascending: false })
            .limit(1);
        }
        
        console.log(`[Cron] ${actualScanId} - Refresh completed successfully`);
        
        results.push({
          scanId: actualScanId,
          status: 'completed',
          reason,
          message: 'Refresh completed'
        });
        
      } catch (error: any) {
        console.error(`[Cron] Error refreshing scan ${scan.id}:`, error);
        
        // Mark as failed
        const failedAt = new Date().toISOString();
        if (refreshLogId) {
          await supabase
            .from('refresh_logs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: failedAt
            })
            .eq('id', refreshLogId);
        } else if (actualScanId) {
          await supabase
            .from('refresh_logs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: failedAt
            })
            .eq('scan_id', actualScanId)
            .eq('status', 'running')
            .order('started_at', { ascending: false })
            .limit(1);
        }
        
        results.push({
          scanId: actualScanId || scan.id,
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
