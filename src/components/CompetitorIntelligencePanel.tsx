/**
 * Competitor Intelligence Panel
 * Displays enriched competitor data in expandable sections
 */

import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useCompetitorIntelligence, enrichCompetitor } from '@/hooks/useCompetitorIntelligence'
import { 
  Globe, Building2, Users, Briefcase, BookOpen, TrendingUp, 
  ExternalLink, Loader2, Sparkles, ChevronDown, ChevronUp,
  Linkedin, Twitter, Facebook, Instagram, Youtube
} from 'lucide-react'
import type { Competitor } from '@/lib/supabase'

interface Props {
  competitor: Competitor
  userId: string // Pass userId from parent instead of using useUser here
}

export default function CompetitorIntelligencePanel({ competitor, userId }: Props) {
  const { intelligence, loading, error } = useCompetitorIntelligence(competitor.id)
  const [enriching, setEnriching] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const handleEnrich = async () => {
    if (!userId || enriching) return
    
    setEnriching(true)
    try {
      await enrichCompetitor(competitor.id, userId)
      // Refresh page to show new data
      window.location.reload()
    } catch (err: any) {
      alert('Enrichment failed: ' + err.message)
    } finally {
      setEnriching(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <span className="ml-3 text-slate-400">Loading intelligence...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        Error loading intelligence: {error}
      </div>
    )
  }

  if (!intelligence) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No Intelligence Data Yet
        </h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Enrich this competitor to unlock deep insights: company info, social media, 
          hiring activity, news, and more.
        </p>
        <button
          onClick={handleEnrich}
          disabled={enriching}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
                     disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg 
                     font-medium transition"
        >
          {enriching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Enrich Competitor
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 mt-3">
          Powered by FireCrawl · Takes ~60 seconds
        </p>
      </div>
    )
  }

  const Section = ({ id, title, icon: Icon, children }: any) => {
    const isExpanded = expandedSections.has(id)
    return (
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-white">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 bg-slate-900/30">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Intelligence Report</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Last updated: {new Date(intelligence.last_enriched_at).toLocaleDateString()}
          </span>
          <button
            onClick={handleEnrich}
            disabled={enriching}
            className="text-sm px-3 py-1 border border-indigo-500/30 text-indigo-400 
                       hover:bg-indigo-500/10 rounded-lg transition disabled:opacity-50"
          >
            {enriching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview */}
      <Section id="overview" title="Overview" icon={Globe}>
        {intelligence.company_description && (
          <p className="text-slate-300 mb-4">{intelligence.company_description}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          {intelligence.headquarters && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Headquarters</div>
              <div className="text-white">{intelligence.headquarters}</div>
            </div>
          )}
          {intelligence.number_of_locations && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Locations</div>
              <div className="text-white">{intelligence.number_of_locations}</div>
            </div>
          )}
        </div>
        {intelligence.homepage_screenshot_url && (
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Homepage Screenshot</div>
            <img 
              src={intelligence.homepage_screenshot_url} 
              alt="Homepage"
              className="rounded-lg border border-slate-700"
            />
          </div>
        )}
      </Section>

      {/* Company Info */}
      {(intelligence.company_history || intelligence.mission_statement) && (
        <Section id="company" title="Company Information" icon={Building2}>
          {intelligence.mission_statement && (
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-1">Mission</div>
              <div className="text-white italic">"{intelligence.mission_statement}"</div>
            </div>
          )}
          {intelligence.company_history && (
            <div>
              <div className="text-xs text-slate-500 mb-1">History</div>
              <div className="text-slate-300 text-sm leading-relaxed">{intelligence.company_history}</div>
            </div>
          )}
        </Section>
      )}

      {/* Products & Services */}
      {intelligence.main_products.length > 0 && (
        <Section id="products" title="Products & Services" icon={TrendingUp}>
          <div className="space-y-2">
            {intelligence.main_products.map((product, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <span className="text-slate-300">{product}</span>
              </div>
            ))}
          </div>
          {intelligence.key_value_propositions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-500 mb-2">Value Propositions</div>
              <div className="space-y-2">
                {intelligence.key_value_propositions.map((prop, idx) => (
                  <div key={idx} className="text-sm text-slate-300">• {prop}</div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Social Media */}
      {(intelligence.social_linkedin || intelligence.social_twitter || intelligence.social_facebook || 
        intelligence.social_instagram || intelligence.social_youtube) && (
        <Section id="social" title="Social Media" icon={Users}>
          <div className="grid grid-cols-2 gap-3">
            {intelligence.social_linkedin && (
              <a href={intelligence.social_linkedin} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition">
                <Linkedin className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
            {intelligence.social_twitter && (
              <a href={intelligence.social_twitter} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition">
                <Twitter className="w-5 h-5 text-sky-400" />
                <span className="text-sm text-slate-300">Twitter</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
            {intelligence.social_facebook && (
              <a href={intelligence.social_facebook} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition">
                <Facebook className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-slate-300">Facebook</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
            {intelligence.social_instagram && (
              <a href={intelligence.social_instagram} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition">
                <Instagram className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-slate-300">Instagram</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
            {intelligence.social_youtube && (
              <a href={intelligence.social_youtube} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-sm text-slate-300">YouTube</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
          </div>
        </Section>
      )}

      {/* Careers (Growth Signal) */}
      {intelligence.careers_page_url && (
        <Section id="careers" title="Hiring Activity" icon={Briefcase}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300">
              <span className="text-2xl font-bold text-white">{intelligence.open_positions_count}</span>
              {' '}open positions
            </span>
            <a href={intelligence.careers_page_url} target="_blank" rel="noopener noreferrer"
               className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View careers page
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {intelligence.open_positions.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {intelligence.open_positions.map((job, idx) => (
                <div key={idx} className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                  <div className="text-white font-medium">{job.title}</div>
                  {(job.department || job.location) && (
                    <div className="text-xs text-slate-400 mt-1">
                      {[job.department, job.location].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* News & Blog */}
      {intelligence.has_blog && (
        <Section id="news" title="News & Blog" icon={BookOpen}>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Blog detected</span>
            {intelligence.news_page_url && (
              <a href={intelligence.news_page_url} target="_blank" rel="noopener noreferrer"
                 className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Visit blog
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
