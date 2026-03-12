'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useUser } from '@clerk/react'
import { useSubscription } from '@/hooks/useSubscription'
import { Settings as SettingsIcon, User, Building, Globe, Bell, Zap, Save, Plus, X, Moon, Sun, RefreshCw, Lock, Crown, Settings, Mail, HelpCircle } from 'lucide-react'
import UpgradeModal from './UpgradeModal'
import { INDUSTRIES } from '@/constants/industries'

const REGIONS = ['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa']
const INDUSTRIES_WITH_EMPTY = ['', ...INDUSTRIES]

export default function SettingsView() {
  const { user } = useUser()
  const { settings, updateSettings, updateProfile, updateScanPreferences, t } = useSettings()
  const { plan, limits } = useSubscription()
  const [saved, setSaved] = useState(false)
  const [watchlistInput, setWatchlistInput] = useState('')
  // Removed activeSection state - single page now
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Load onboarding data into settings on mount
  useEffect(() => {
    // ✅ CRITICAL: Only load if we have a valid user ID
    if (!user?.id) return
    
    // ✅ SECURITY: Verify this is the current user's data
    // Settings context should be scoped to user.id
    if (user?.unsafeMetadata) {
      const meta = user.unsafeMetadata as any
      const onboardingData = meta.onboardingData
      
      // Only load if onboarding data exists AND settings are empty (first load only)
      // This prevents overwriting settings with stale data on subsequent renders
      if (!onboardingData) return
      
      // Load profile data (only if current settings are empty)
      if (onboardingData?.companyName && !settings.profile.company) {
        console.log('[SettingsView] Loading onboarding data for user:', user.id)
        updateProfile({ 
          company: onboardingData.companyName,
          companyUrl: onboardingData.companyUrl || '',
          defaultIndustry: onboardingData.industry || ''
        })
      }
      
      // Load scan preferences (only if defaults are still active)
      if (onboardingData && Object.keys(settings.scanPreferences).length === 3) {
        const newPrefs: any = {}
        
        if (onboardingData.competitorCount) {
          newPrefs.maxCompetitors = parseInt(onboardingData.competitorCount)
        }
        
        if (onboardingData.regions && onboardingData.regions.length > 0) {
          newPrefs.targetRegions = onboardingData.regions
        }
        
        if (Object.keys(newPrefs).length > 0) {
          updateScanPreferences(newPrefs)
        }
      }
    }
  }, [user?.id]) // ✅ Only re-run when userId changes (not on every user object change)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addWatchlistItem = () => {
    const item = watchlistInput.trim()
    if (!item) return
    
    // ✅ CHECK PLAN LIMIT
    const maxItems = limits.competitors
    if (settings.scanPreferences.watchlist.length >= maxItems) {
      alert(`Your ${plan} plan allows up to ${maxItems} competitors in watchlist. Upgrade for more.`)
      return
    }
    
    // Check for duplicates (case-insensitive)
    const exists = settings.scanPreferences.watchlist.some(
      w => w.toLowerCase() === item.toLowerCase()
    )
    
    if (exists) {
      alert('This competitor is already in your watchlist.')
      return
    }
    
    updateScanPreferences({ watchlist: [...settings.scanPreferences.watchlist, item] })
    setWatchlistInput('')
    showSaved()
  }

  const removeWatchlistItem = (item: string) => {
    updateScanPreferences({ watchlist: settings.scanPreferences.watchlist.filter(w => w !== item) })
    showSaved()
  }

  const toggleRegion = (region: string) => {
    const current = settings.scanPreferences.targetRegions
    if (region === 'Global') {
      updateScanPreferences({ targetRegions: ['Global'] })
    } else {
      const without = current.filter(r => r !== 'Global' && r !== region)
      if (current.includes(region)) {
        updateScanPreferences({ targetRegions: without.length > 0 ? without : ['Global'] })
      } else {
        updateScanPreferences({ targetRegions: [...without, region] })
      }
    }
    showSaved()
  }

  const inputClass = "w-full bg-slate-800 light:bg-white text-white light:text-slate-900 px-4 py-3 rounded-lg border border-slate-700 light:border-slate-300 focus:border-indigo-500 focus:outline-none"
  const cardClass = "bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 rounded-xl p-6"
  const labelClass = "block text-sm font-medium text-slate-400 light:text-slate-600 mb-2"

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white light:text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            {t('settings.title')}
          </h2>
        </div>
        {saved && (
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm animate-pulse">
            ✓ {t('settings.saved')}
          </div>
        )}
      </div>

      {/* Removed Section Tabs - Settings is now single page */}

      {/* Auto-refresh notice - Only for plans with automated refresh */}
      {plan !== 'free' && (
        <div className={`${cardClass} mb-6 bg-indigo-600/10 border-indigo-500/30`}>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-indigo-300 mb-1">Automated Refresh Schedule</h3>
              <p className="text-sm text-slate-300">
                Your scans auto-refresh <span className="font-semibold text-white">
                {plan === 'starter' ? 'daily (midnight UTC)' : 'hourly'}
                </span> based on your <span className="capitalize font-semibold text-white">{plan}</span> plan.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                All refresh activity is tracked in the Activity tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free plan manual refresh notice */}
      {plan === 'free' && (
        <div className={`${cardClass} mb-6 bg-slate-800/50 border-slate-700`}>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-slate-300 mb-1">Manual Refresh Only</h3>
              <p className="text-sm text-slate-400">
                Free plan includes <span className="font-semibold text-white">1 manual refresh per day</span>.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Upgrade to Starter for daily automated scans, or Pro for hourly updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management - Only show for paid plans */}
      {plan !== 'free' && (
        <div className={`${cardClass} mb-6`}>
          <h3 className="text-lg font-bold text-white light:text-slate-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-indigo-400" />
            Subscription Management
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 light:bg-slate-50 rounded-lg border border-slate-700 light:border-slate-200">
              <div>
                <div className="text-sm text-slate-400 light:text-slate-600 mb-1">Current Plan</div>
                <div className="text-lg font-bold text-white light:text-slate-900 capitalize">{plan}</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/.netlify/functions/create-portal-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user?.id })
                    })
                    const data = await response.json()
                    if (data.url) {
                      window.location.href = data.url
                    } else {
                      alert('Unable to open billing portal. Please try again.')
                    }
                  } catch (error) {
                    console.error('Portal error:', error)
                    alert('Failed to open billing portal. Please try again.')
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Subscription
              </button>
            </div>
            <p className="text-sm text-slate-500 light:text-slate-600">
              Update payment method, change plan, view invoices, or cancel your subscription.
            </p>
          </div>
        </div>
      )}
      
      {/* Appearance */}
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold text-white light:text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {t('settings.appearance')}
        </h3>
        
        <div className="space-y-6">
          {/* Theme Mode */}
          <div>
            <label className={labelClass}>Theme Mode</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => { updateSettings({ theme }); showSaved() }}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition ${
                    settings.theme === theme
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 light:bg-slate-100 border-slate-700 light:border-slate-300 text-slate-400 light:text-slate-700 hover:border-slate-600'
                  }`}
                >
                  {theme === 'dark' ? (
                    <span className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold text-white light:text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('settings.profile')}
        </h3>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={e => { updateProfile({ name: e.target.value }); showSaved() }}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={e => { updateProfile({ email: e.target.value }); showSaved() }}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company</label>
              <input
                type="text"
                value={settings.profile.company}
                onChange={e => { updateProfile({ company: e.target.value }); showSaved() }}
                className={inputClass}
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className={labelClass}>Company Website</label>
              <input
                type="url"
                value={settings.profile.companyUrl}
                onChange={e => { updateProfile({ companyUrl: e.target.value }); showSaved() }}
                className={inputClass}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Default Industry</label>
            <select
              value={settings.profile.defaultIndustry}
              onChange={e => { updateProfile({ defaultIndustry: e.target.value }); showSaved() }}
              className={inputClass}
            >
              <option value="">Auto-detect / None</option>
              {INDUSTRIES_WITH_EMPTY.filter(Boolean).map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scan Preferences */}
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold text-white light:text-slate-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t('settings.scan_prefs')}
        </h3>
        
        <div className="space-y-6">
          {/* Max Competitors */}
          <div>
            <label className={labelClass}>Max Competitors per Scan</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 5, badge: null },
                { value: 10, badge: 'STARTER' },
                { value: 15, badge: 'PRO' },
                { value: 20, label: '20', badge: 'BUSINESS' }
              ].map(opt => {
                // ✅ Handle exact value matching (no 999 unlimited anymore)
                const isSelected = settings.scanPreferences.maxCompetitors === opt.value
                const isLocked = opt.value > limits.competitors
                
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true)
                      } else {
                        updateScanPreferences({ maxCompetitors: opt.value })
                        showSaved()
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : isLocked
                        ? 'bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-pointer opacity-60 hover:opacity-80'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {opt.label || opt.value}
                    {opt.badge && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                        isLocked ? 'bg-slate-700 text-slate-500' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {opt.badge}
                      </span>
                    )}
                    {isLocked && <Lock className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Automated Refresh Frequency */}
          <div>
            <label className={labelClass}>Automated Refresh Frequency</label>
            <div className="flex gap-2">
              {([
                { value: 'daily' as const, label: 'Daily (Auto)', badge: 'STARTER', minPlan: 'starter' },
                { value: 'hourly' as const, label: 'Hourly (Auto)', badge: 'PRO', minPlan: 'pro' },
              ]).map(freq => {
                const isLocked = plan === 'free' || (freq.value === 'hourly' && !['pro', 'business', 'enterprise'].includes(plan))
                const isSelected = settings.scanPreferences.scanFrequency === freq.value
                
                return (
                  <button
                    key={freq.value}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true)
                      } else {
                        updateScanPreferences({ scanFrequency: freq.value })
                        showSaved()
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : isLocked
                        ? 'bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-pointer opacity-60 hover:opacity-80'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {freq.label}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                      isLocked ? 'bg-slate-700 text-slate-500' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {freq.badge}
                    </span>
                    {isLocked && <Lock className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
            {plan === 'free' && (
              <p className="text-xs text-slate-500 mt-2 italic">
                Free plan: Manual refresh only. Upgrade for automated scans.
              </p>
            )}
          </div>

          {/* Target Regions */}
          <div className={!limits.features.regionalFilter ? 'opacity-60' : ''}>
            <label className={labelClass}>
              Target Regions
              {!limits.features.regionalFilter && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded font-semibold border border-amber-500/30">
                  PRO Feature
                </span>
              )}
            </label>
            {!limits.features.regionalFilter && (
              <p className="text-xs text-slate-500 mb-3 italic">
                Upgrade to Pro to filter competitors by geographic region.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => {
                    if (!limits.features.regionalFilter) {
                      setShowUpgradeModal(true)
                    } else {
                      toggleRegion(region)
                      showSaved()
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                    limits.features.regionalFilter && settings.scanPreferences.targetRegions.includes(region)
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : !limits.features.regionalFilter
                      ? 'bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-pointer hover:opacity-80'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {region}
                  {!limits.features.regionalFilter && <Lock className="w-3 h-3 ml-1 inline" />}
                </button>
              ))}
            </div>
          </div>

          {/* Competitors Watchlist */}
          <div className={!limits.features.customWatchlist ? 'opacity-60' : ''}>
            <label className={labelClass}>
              Competitors Watchlist
              {!limits.features.customWatchlist && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded font-semibold border border-amber-500/30">
                  PRO Feature
                </span>
              )}
              {limits.features.customWatchlist && (
                <span className="ml-2 text-xs text-slate-500">
                  {settings.scanPreferences.watchlist.length}/{limits.competitors}
                </span>
              )}
            </label>
            <p className="text-xs text-slate-500 mb-3">
              {limits.features.customWatchlist 
                ? (settings.language === 'fr' 
                    ? 'Compagnies à toujours inclure dans les scans (priorité maximale)' 
                    : 'Companies to always include in scans (top priority)')
                : 'Upgrade to Pro to create a custom watchlist of competitors.'
              }
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={watchlistInput}
                onChange={e => limits.features.customWatchlist && setWatchlistInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && limits.features.customWatchlist && addWatchlistItem()}
                onClick={() => !limits.features.customWatchlist && setShowUpgradeModal(true)}
                className={`${inputClass} flex-1 ${!limits.features.customWatchlist ? 'cursor-pointer opacity-60' : ''}`}
                placeholder={settings.language === 'fr' ? 'Nom ou URL de la compagnie' : 'Company name or URL'}
              />
              <button
                onClick={() => limits.features.customWatchlist ? addWatchlistItem() : setShowUpgradeModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center ${
                  limits.features.customWatchlist
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-pointer hover:bg-slate-600'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {settings.scanPreferences.watchlist.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.scanPreferences.watchlist.map(item => (
                  <div key={item} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                    <span>{item}</span>
                    <button 
                      onClick={() => limits.features.customWatchlist && removeWatchlistItem(item)} 
                      disabled={!limits.features.customWatchlist}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 italic">{settings.language === 'fr' ? 'Aucune compagnie dans la liste' : 'No companies in watchlist'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className={cardClass}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white light:text-slate-900 mb-2">
              {settings.language === 'fr' ? 'Besoin d\'aide ?' : 'Need Help?'}
            </h3>
            <p className="text-slate-400 light:text-slate-600 mb-4">
              {settings.language === 'fr' 
                ? 'Notre équipe de support est là pour vous aider avec toutes vos questions sur WyzeLens.'
                : 'Our support team is here to help you with any questions about WyzeLens.'}
            </p>
            <a
              href="mailto:support@labwyze.com?subject=WyzeLens Support Request"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              <Mail className="w-4 h-4" />
              {settings.language === 'fr' ? 'Contacter le Support' : 'Contact Support'}
            </a>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="Advanced scan preferences"
      />
    </div>
  )
}
