import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[Delete] Missing Supabase credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const { scanId, userId } = JSON.parse(event.body || '{}');

    if (!scanId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'scanId and userId required' })
      };
    }

    console.log(`[Delete] Deleting scan ${scanId} for user ${userId}`);

    // Verify scan belongs to user
    const { data: scan, error: fetchError } = await supabase
      .from('scans')
      .select('id, user_id, industry')
      .eq('id', scanId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !scan) {
      console.error('[Delete] Scan not found or access denied:', fetchError);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Scan not found or access denied' })
      };
    }

    // Delete scan (cascade will delete related data: competitors, alerts, insights, news, refresh_logs)
    const { error: deleteError } = await supabase
      .from('scans')
      .delete()
      .eq('id', scanId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Delete] Delete failed:', deleteError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Delete failed: ${deleteError.message}` })
      };
    }

    console.log(`[Delete] Successfully deleted scan ${scanId} (${scan.industry})`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Profile "${scan.industry}" deleted successfully`
      })
    };

  } catch (error: any) {
    console.error('[Delete] Fatal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
