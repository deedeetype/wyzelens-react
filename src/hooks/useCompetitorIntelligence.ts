/**
 * Hook to fetch competitor intelligence data
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CompetitorIntelligence } from '@/types/intelligence'

export function useCompetitorIntelligence(competitorId: string | null) {
  const [intelligence, setIntelligence] = useState<CompetitorIntelligence | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!competitorId) {
      setIntelligence(null)
      return
    }

    async function fetchIntelligence() {
      console.log('[useCompetitorIntelligence] Fetching intelligence for:', competitorId)
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('competitor_intelligence')
          .select('*')
          .eq('competitor_id', competitorId)
          .single()

        console.log('[useCompetitorIntelligence] Query result:', { data, error: supabaseError })

        if (supabaseError) {
          // 404 means not enriched yet (not an error)
          if (supabaseError.code === 'PGRST116') {
            console.log('[useCompetitorIntelligence] No intelligence data found (not enriched yet)')
            setIntelligence(null)
          } else {
            console.error('[useCompetitorIntelligence] Supabase error:', supabaseError)
            throw supabaseError
          }
        } else {
          console.log('[useCompetitorIntelligence] Intelligence loaded:', data)
          setIntelligence(data)
        }
      } catch (err: any) {
        console.error('[useCompetitorIntelligence] Failed to fetch:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIntelligence()
  }, [competitorId])

  return { intelligence, loading, error }
}

export async function enrichCompetitor(competitorId: string, userId: string): Promise<CompetitorIntelligence> {
  const response = await fetch('/.netlify/functions/enrich-competitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitorId, userId })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to enrich competitor')
  }

  const result = await response.json()
  return result.data
}
