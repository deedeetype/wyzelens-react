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
    console.log('[Cron] Starting scheduled scan check...');
    
    // Get current time
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay();
    const currentDate = now.getUTCDate();
    
    // Fetch all enabled schedules
    const { data: schedules, error: scheduleError } = await supabase
      .from('scan_schedules')
      .select(`
        *,
        scans:scan_id (
          id,
          industry,
          company_name,
          company_url,
          user_id
        )
      `)
      .eq('enabled', true);
    
    if (scheduleError) {
      console.error('[Cron] Error fetching schedules:', scheduleError);
      throw scheduleError;
    }
    
    console.log(`[Cron] Found ${schedules?.length || 0} enabled schedules`);
    
    const scansToRun = [];
    const schedulesToUpdate = [];
    
    // Check each schedule
    for (const schedule of schedules || []) {
      const shouldRun = checkIfScheduleShouldRun(schedule, now);
      
      if (shouldRun) {
        console.log(`[Cron] Schedule ${schedule.id} is due for scan ${schedule.scan_id}`);
        scansToRun.push({
          scanId: schedule.scan_id,
          schedule: schedule,
          scan: schedule.scans
        });
        
        // Calculate next run time
        const nextRun = calculateNextRun(schedule, now);
        schedulesToUpdate.push({
          id: schedule.id,
          last_run_at: now.toISOString(),
          next_run_at: nextRun.toISOString()
        });
      }
    }
    
    console.log(`[Cron] ${scansToRun.length} scans to run`);
    
    // Execute each scan - ALL 4 STEPS
    const results = [];
    for (const { scanId, scan, schedule } of scansToRun) {
      const scanStartTime = Date.now();
      const SCAN_TIMEOUT_MS = 9 * 60 * 1000; // 9 minutes (Netlify has 10 min limit)
      
      let refreshLogId: number | undefined;
      let actualScanId: string | undefined;
      
      try {
        console.log(`[Cron] Triggering full refresh for scan ${scanId}`);
        
        // Step 1: Init (with explicit isRefresh flag)
        console.log(`[Cron] ${scanId} - Step 1: Init (refresh mode)`);
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
            isRefresh: true  // ← Explicit: This is a refresh, not a new scan
          })
        });
        
        const step1Result = await step1Response.json();
        
        if (!step1Result.success) {
          throw new Error(`Step 1 failed: ${step1Result.error || 'Unknown error'}`);
        }
        
        actualScanId = step1Result.scanId;
        const isRefresh = step1Result.isRefresh;
        console.log(`[Cron] ${scanId} - Step 1 complete, actual scanId: ${actualScanId}, isRefresh: ${isRefresh}`);
        
        // Log the refresh start
        const refreshStartTime = now.toISOString();
        const { data: logData, error: logError } = await supabase
          .from('refresh_logs')
          .insert({
            scan_id: actualScanId,
            user_id: scan.user_id,
            industry: scan.industry,
            status: 'running',
            triggered_by: 'scheduled',
            started_at: refreshStartTime
          })
          .select('id')
          .single();
        
        if (logError) {
          console.error(`[Cron] Failed to create refresh_log:`, logError);
        }
        
        refreshLogId = logData?.id;
        
        if (isRefresh) {
          // REFRESH MODE: Skip competitors, only update news + analyze
          console.log(`[Cron] ${actualScanId} - REFRESH MODE: Fetching news + analyzing`);
          
          // Check timeout before each step
          if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
            throw new Error('Scan timeout exceeded before news step');
          }
          
          // Step: News (fetch first to get fresh data)
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
          console.log(`[Cron] ${actualScanId} - News fetched successfully`);
          
          // Check timeout before analyze step
          if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
            throw new Error('Scan timeout exceeded before analyze step');
          }
          
          // Step: Analyze (generate insights/alerts from fresh news)
          console.log(`[Cron] ${actualScanId} - Analyzing (insights + alerts)`);
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
          console.log(`[Cron] ${actualScanId} - Analysis complete (insights/alerts updated)`);
          
        } else {
          // NEW SCAN MODE: Execute all steps
          console.log(`[Cron] ${actualScanId} - NEW SCAN MODE: Executing full scan`);
          
          // Check timeout before competitors step
          if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
            throw new Error('Scan timeout exceeded before competitors step');
          }
          
          // Step: Competitors
          console.log(`[Cron] ${actualScanId} - Fetching competitors`);
          const competitorsResponse = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step: 'competitors',
              scanId: actualScanId,
              industry: scan.industry,
              userId: scan.user_id
            })
          });
          
          const competitorsResult = await competitorsResponse.json();
          if (!competitorsResult.success) {
            throw new Error(`Competitors fetch failed: ${competitorsResult.error || 'Unknown error'}`);
          }
          console.log(`[Cron] ${actualScanId} - Competitors fetched`);
          
          // Check timeout before news step
          if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
            throw new Error('Scan timeout exceeded before news step');
          }
          
          // Step: News
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
          
          // Check timeout before final analyze step
          if (Date.now() - scanStartTime > SCAN_TIMEOUT_MS) {
            throw new Error('Scan timeout exceeded before analyze step');
          }
          
          // Step: Analyze (insights + alerts)
          console.log(`[Cron] ${actualScanId} - Analyzing`);
          const analyzeResponse = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step: 'analyze',
              scanId: actualScanId,
              industry: scan.industry,
              userId: scan.user_id,
              companies: competitorsResult.companies || [],
              news: newsResult.news || [],
              isRefresh: false
            })
          });
          
          const analyzeResult = await analyzeResponse.json();
          if (!analyzeResult.success) {
            throw new Error(`Analysis failed: ${analyzeResult.error || 'Unknown error'}`);
          }
          console.log(`[Cron] ${actualScanId} - Analysis complete`);
        }
        
        // Mark scan as completed
        await supabase
          .from('scans')
          .update({ status: 'completed', updated_at: now.toISOString() })
          .eq('id', actualScanId);
        
        // Count new items added during this refresh (by is_new flag)
        const { data: newsCount } = await supabase
          .from('news_feed')
          .select('id', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        const { data: insightsCount } = await supabase
          .from('insights')
          .select('id', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        const { data: alertsCount } = await supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('scan_id', actualScanId)
          .eq('is_new', true);
        
        const counts = {
          new_news_count: newsCount || 0,
          new_insights_count: insightsCount || 0,
          new_alerts_count: alertsCount || 0
        };
        
        console.log(`[Cron] ${actualScanId} - New items: ${counts.new_insights_count} insights, ${counts.new_alerts_count} alerts, ${counts.new_news_count} news`);
        
        // Update refresh log with counts
        const completedAt = new Date().toISOString();
        if (refreshLogId) {
          console.log(`[Cron] ${actualScanId} - Updating refresh_log ${refreshLogId} to completed`);
          const { error: updateError } = await supabase
            .from('refresh_logs')
            .update({ 
              status: 'completed',
              new_alerts_count: counts.new_alerts_count,
              new_insights_count: counts.new_insights_count,
              new_news_count: counts.new_news_count,
              completed_at: completedAt
            })
            .eq('id', refreshLogId);
          
          if (updateError) {
            console.error(`[Cron] Failed to update refresh_log ${refreshLogId}:`, updateError);
          }
        } else if (actualScanId) {
          console.log(`[Cron] ${actualScanId} - No refreshLogId, searching by scan_id`);
          const { error: updateError } = await supabase
            .from('refresh_logs')
            .update({ 
              status: 'completed',
              new_alerts_count: counts.new_alerts_count,
              new_insights_count: counts.new_insights_count,
              new_news_count: counts.new_news_count,
              completed_at: completedAt
            })
            .eq('scan_id', actualScanId)
            .eq('status', 'running')
            .order('started_at', { ascending: false })
            .limit(1);
          
          if (updateError) {
            console.error(`[Cron] Failed to update refresh_log by scan_id:`, updateError);
          }
        }
        
        console.log(`[Cron] ${actualScanId} - Full refresh completed successfully`);
        
        results.push({
          scanId: actualScanId,
          status: 'completed',
          message: 'All 4 steps completed successfully'
        });
        
      } catch (error: any) {
        console.error(`[Cron] Error running scan ${scanId}:`, error);
        
        // Mark as failed in refresh_logs
        const failedAt = new Date().toISOString();
        if (refreshLogId) {
          console.log(`[Cron] ${scanId} - Marking refresh_log ${refreshLogId} as failed`);
          const { error: updateError } = await supabase
            .from('refresh_logs')
            .update({ 
              status: 'failed', 
              error_message: error.message,
              completed_at: failedAt
            })
            .eq('id', refreshLogId);
          
          if (updateError) {
            console.error(`[Cron] Failed to update failed status for refresh_log ${refreshLogId}:`, updateError);
          }
        } else if (actualScanId) {
          console.log(`[Cron] ${actualScanId} - No refreshLogId, marking latest running log as failed`);
          const { error: updateError } = await supabase
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
          
          if (updateError) {
            console.error(`[Cron] Failed to update failed status by scan_id:`, updateError);
          }
        } else {
          console.warn(`[Cron] ${scanId} - No actualScanId or refreshLogId, cannot mark refresh_log as failed`);
        }
        
        results.push({
          scanId: actualScanId || scanId,
          status: 'error',
          message: error.message
        });
      }
    }
    
    // Update schedules with last/next run times
    for (const update of schedulesToUpdate) {
      await supabase
        .from('scan_schedules')
        .update({
          last_run_at: update.last_run_at,
          next_run_at: update.next_run_at,
          updated_at: now.toISOString()
        })
        .eq('id', update.id);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        schedulesChecked: schedules?.length || 0,
        scansTriggered: scansToRun.length,
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

function checkIfScheduleShouldRun(schedule: any, now: Date): boolean {
  // If no last_run_at, it's never been run
  if (!schedule.last_run_at) {
    return true;
  }
  
  const lastRun = new Date(schedule.last_run_at);
  const hoursDiff = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
  
  // Check based on frequency
  switch (schedule.frequency) {
    case 'hourly':
      // Run every hour (at least 59 minutes since last run)
      return hoursDiff >= 0.98;
    
    case 'daily':
      // Run if it's been at least 23 hours and it's the right hour
      return hoursDiff >= 23 && now.getUTCHours() === schedule.hour;
    
    case 'weekly':
      // Run if it's been at least 6 days and it's the right day and hour
      return hoursDiff >= 24 * 6 && 
             now.getUTCDay() === schedule.day_of_week && 
             now.getUTCHours() === schedule.hour;
    
    default:
      return false;
  }
}

function calculateNextRun(schedule: any, from: Date): Date {
  const next = new Date(from);
  
  // Set the hour and minute
  next.setUTCHours(schedule.hour);
  next.setUTCMinutes(schedule.minute || 0);
  next.setUTCSeconds(0);
  next.setUTCMilliseconds(0);
  
  switch (schedule.frequency) {
    case 'hourly':
      // Next hour
      next.setUTCHours(from.getUTCHours() + 1);
      break;
    
    case 'daily':
      // Next day at the scheduled time
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    
    case 'weekly':
      // Next occurrence of the scheduled day
      const daysUntilNext = (schedule.day_of_week - from.getUTCDay() + 7) % 7 || 7;
      next.setUTCDate(from.getUTCDate() + daysUntilNext);
      break;
  }
  
  return next;
}