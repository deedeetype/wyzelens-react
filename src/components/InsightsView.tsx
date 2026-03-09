'use client'

import { useState, useEffect } from 'react'
import { type Insight } from '@/lib/supabase'
import { useNewsActions } from '@/hooks/useNewsActions'
import { useArchivedInsights } from '@/hooks/useArchivedInsights'
import { Lightbulb, AlertTriangle, Sparkles, TrendingUp, Target, X, Archive } from 'lucide-react'
import ActionMenu from './ActionMenu'

interface Props {
  insights: Insight[]
  loading: boolean
  archiveInsightOptimistic: (id: string) => void
  refetch: () => void
  scanId?: string
}

export default function InsightsView({ insights, loading, archiveInsightOptimistic, refetch, scanId }: Props) {
  const { archiveInsight, unarchiveInsight, deleteInsight } = useNewsActions()
  const { archivedInsights, archivedCount, loading: archivedLoading, fetchArchived, fetchArchivedCount } = useArchivedInsights(scanId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'new'>('date')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchArchivedCount()
  }, [scanId])

  useEffect(() => {
    if (showArchived) {
      fetchArchived()
    }
  }, [showArchived])

  const displayInsights = showArchived ? archivedInsights : insights
  const filtered = (filterType === 'all' ? displayInsights : displayInsights.filter(i => i.type === filterType))
    .sort((a, b) => {
      if (sortBy === 'new') {
        // NEW badges first
        if (a.is_new && !b.is_new) return -1
        if (!a.is_new && b.is_new) return 1
        // Then by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        // Default: sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const handleArchive = async (insightId: string) => {
    try {
      archiveInsightOptimistic(insightId)
      await archiveInsight(insightId)
      await fetchArchivedCount()
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(insightId)
        return next
      })
    } catch (error) {
      await refetch()
      alert('Failed to archive insight')
    }
  }

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => {
        archiveInsightOptimistic(id)
        return archiveInsight(id)
      }))
      await fetchArchivedCount()
      setSelectedIds(new Set())
    } catch (error) {
      await refetch()
      alert('Failed to archive insights')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} insight(s)? This cannot be undone.`)) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => handleDelete(id)))
      setSelectedIds(new Set())
    } catch (error) {
      alert('Failed to delete insights')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleUnarchive = async (insightId: string) => {
    try {
      await unarchiveInsight(insightId)
      await fetchArchived()
      await refetch()
      await fetchArchivedCount()
    } catch (error) {
      alert('Failed to unarchive insight')
    }
  }

  const handleDelete = async (insightId: string) => {
    try {
      await deleteInsight(insightId)
      if (showArchived) {
        await fetchArchived()
      } else {
        await refetch()
      }
      await fetchArchivedCount()
    } catch (error) {
      alert('Failed to delete insight')
    }
  }

  const TypeIcon = ({ type }: { type: string }) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'threat': return <AlertTriangle className={iconClass} />
      case 'opportunity': return <Sparkles className={iconClass} />
      case 'trend': return <TrendingUp className={iconClass} />
      case 'recommendation': return <Target className={iconClass} />
      default: return <Lightbulb className={iconClass} />
    }
  }

  const typeStyle = (type: string) => {
    const styles: Record<string, string> = {
      threat: 'bg-red-500/10 text-red-400 border-red-500/30',
      opportunity: 'bg-green-500/10 text-green-400 border-green-500/30',
      trend: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      recommendation: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    }
    return styles[type] || styles.recommendation
  }

  const impactStyle = (impact: string | null) => {
    const styles: Record<string, string> = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    }
    return styles[impact || 'medium'] || styles.medium
  }

  if (loading) {
    return <div className="text-slate-400 text-center py-20">Loading insights...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            AI Insights
          </h2>
          <p className="text-slate-400 mt-1">
            {insights.length} insights generated
            {selectedIds.size > 0 && <span className="text-indigo-400"> · {selectedIds.size} selected</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm"
          >
            <option value="date">Sort: Newest First</option>
            <option value="new">Sort: NEW First</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm"
          >
            <option value="all">All Types</option>
            <option value="threat">Threats</option>
            <option value="opportunity">Opportunities</option>
            <option value="trend">Trends</option>
            <option value="recommendation">Recommendations</option>
          </select>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            {showArchived ? 'Hide' : 'Show'} Archived {archivedCount > 0 && `(${archivedCount})`}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {filtered.length > 0 && (
        <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
            >
              {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-slate-400">
              {selectedIds.size} of {filtered.length} selected
            </span>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              {!showArchived && (
                <button
                  onClick={handleBulkArchive}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archive ({selectedIds.size})
                </button>
              )}
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
              >
                Delete ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Insights List with Accordion */}
      <div className="space-y-3">
        {filtered.map((insight) => {
          const isExpanded = expandedId === insight.id
          
          return (
            <div
              key={insight.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                isExpanded ? 'border-indigo-500/50' : 'border-slate-800'
              }`}
            >
              {/* Insight Header - Always Visible */}
              <div
                className={`flex items-start gap-4 p-4 transition ${
                  isExpanded ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(insight.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleSelect(insight.id)
                  }}
                  className="mt-3 w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <TypeIcon type={insight.type} />
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{insight.title}</h3>
                    {insight.is_new && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                        NEW
                      </span>
                    )}
                  </div>
                  {!isExpanded && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{insight.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${typeStyle(insight.type)}`}>
                      {insight.type}
                    </span>
                    {insight.impact && (
                      <span className={`text-xs ${impactStyle(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    )}
                    {insight.confidence && (
                      <span className="text-xs text-slate-500">{Math.round(insight.confidence * 100)}% confidence</span>
                    )}
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    <ActionMenu
                      itemId={insight.id}
                      onArchive={showArchived ? handleUnarchive : handleArchive}
                      onDelete={handleDelete}
                      deleteConfirmTitle="Delete Insight?"
                      deleteConfirmMessage="This AI-generated insight will be permanently removed."
                      isArchived={showArchived}
                    />
                    <button className="text-slate-400 hover:text-white">
                      <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-800">
                  <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                    <p className="text-slate-300 leading-relaxed">{insight.description}</p>

                    {insight.confidence && (
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-xs text-slate-400">Confidence:</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-xs">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${insight.confidence * 100}%` }} />
                        </div>
                        <span className="text-sm text-indigo-300 font-medium">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    )}
                    
                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Recommended Actions:</h4>
                        <ul className="space-y-2">
                          {insight.action_items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-indigo-400 mt-0.5">→</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-slate-400 text-center py-12">No insights found</div>
        )}
      </div>
    </div>
  )
}
