/**
 * Hook to fetch archived news items
 */

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { createSupabaseClient } from '@/lib/supabase'
import { type NewsItem } from '@/contexts/NewsFeedContext'

export function useArchivedNews(scanId?: string) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [archivedNews, setArchivedNews] = useState<NewsItem[]>([])
  const [archivedCount, setArchivedCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchArchived = async () => {
    setLoading(true)
    try {
      const token = await getToken({ template: 'supabase' })
      const supabase = createSupabaseClient(token || undefined)
      
      let query = supabase
        .from('news_feed')
        .select('*')
        .eq('archived', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      
      if (scanId) {
        query = query.eq('scan_id', scanId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Add read status from localStorage (scoped by user)
      const storageKey = user?.id ? `wyzelens_news_read_${user.id}` : 'wyzelens_news_read_guest'
      const readStatus = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const newsWithRead = (data || []).map(item => ({
        ...item,
        read: readStatus[item.id] || false
      }))
      
      setArchivedNews(newsWithRead)
      setArchivedCount(newsWithRead.length)
    } catch (error) {
      console.error('Error fetching archived news:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedCount = async () => {
    try {
      const token = await getToken({ template: 'supabase' })
      const supabase = createSupabaseClient(token || undefined)
      
      let query = supabase
        .from('news_feed')
        .select('*', { count: 'exact', head: true })
        .eq('archived', true)
      
      if (scanId) {
        query = query.eq('scan_id', scanId)
      }
      
      const { count, error } = await query
      
      if (error) throw error
      setArchivedCount(count || 0)
    } catch (error) {
      console.error('Error fetching archived count:', error)
    }
  }

  return { archivedNews, archivedCount, loading, fetchArchived, fetchArchivedCount }
}
