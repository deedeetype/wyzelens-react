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
    
    // Execute each scan
    const results = [];
    for (const { scanId, scan, schedule } of scansToRun) {
      try {
        console.log(`[Cron] Triggering refresh for scan ${scanId}`);
        
        // Call the scan-step function to refresh
        const response = await fetch(`${process.env.URL}/.netlify/functions/scan-step`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'init',
            industry: scan.industry,
            companyUrl: scan.company_url,
            companyName: scan.company_name,
            userId: scan.user_id,
            isScheduled: true
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Log the refresh
          await supabase
            .from('refresh_logs')
            .insert({
              scan_id: scanId,
              user_id: scan.user_id,
              industry: scan.industry,
              status: 'running',
              triggered_by: 'scheduled',
              started_at: now.toISOString()
            });
          
          results.push({
            scanId,
            status: 'started',
            message: 'Refresh started successfully'
          });
        } else {
          results.push({
            scanId,
            status: 'failed',
            message: result.error || 'Failed to start refresh'
          });
        }
      } catch (error: any) {
        console.error(`[Cron] Error running scan ${scanId}:`, error);
        results.push({
          scanId,
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