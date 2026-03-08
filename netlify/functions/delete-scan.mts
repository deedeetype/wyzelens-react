/**
 * WyzeLens Delete Scan Function
 * Deletes a scan and all related data (competitors, alerts, insights, news, refresh_logs)
 * Uses direct fetch API (same pattern as refresh-scan.mts)
 */

import type { Handler } from "@netlify/functions"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[Delete] Missing Supabase credentials')
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Supabase not configured' })
    }
  }

  try {
    const { scanId, userId } = JSON.parse(event.body || '{}')

    if (!scanId || !userId) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'scanId and userId required' })
      }
    }

    console.log(`[Delete] Deleting scan ${scanId} for user ${userId}`)

    // Verify scan belongs to user
    const scanRes = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&user_id=eq.${userId}&select=id,user_id,industry`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )

    if (!scanRes.ok) {
      console.error('[Delete] Scan fetch failed:', scanRes.status, await scanRes.text())
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: 'Failed to fetch scan' })
      }
    }

    const scans = await scanRes.json()
    const scan = scans?.[0]

    if (!scan) {
      console.error('[Delete] Scan not found or access denied')
      return {
        statusCode: 404,
        headers: CORS,
        body: JSON.stringify({ error: 'Scan not found or access denied' })
      }
    }

    // Delete refresh_logs first (not CASCADE configured on foreign key)
    console.log(`[Delete] Deleting refresh_logs for scan ${scanId}`)
    const deleteLogsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/refresh_logs?scan_id=eq.${scanId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )
    
    if (!deleteLogsRes.ok) {
      console.warn('[Delete] refresh_logs delete failed (non-critical):', deleteLogsRes.status)
    } else {
      console.log('[Delete] refresh_logs deleted')
    }
    
    // Delete scan (cascade will delete related data: competitors, alerts, insights, news)
    console.log(`[Delete] Deleting scan ${scanId}`)
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/scans?id=eq.${scanId}&user_id=eq.${userId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    )

    if (!deleteRes.ok) {
      console.error('[Delete] Delete failed:', deleteRes.status, await deleteRes.text())
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: `Delete failed: ${deleteRes.status}` })
      }
    }

    console.log(`[Delete] Successfully deleted scan ${scanId} (${scan.industry})`)

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        message: `Profile "${scan.industry}" deleted successfully`
      })
    }

  } catch (error: any) {
    console.error('[Delete] Fatal error:', error)
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
