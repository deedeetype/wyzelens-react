'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useUser } from '@clerk/react'

export interface UserProfile {
  name: string
  email: string
  photoUrl: string
  company: string
  companyUrl: string
  defaultIndustry: string
}

export interface ScanPreferences {
  maxCompetitors: number
  scanFrequency: 'manual' | 'daily' | 'weekly'
  targetRegions: string[]
  watchlist: string[] // company names/URLs to always include
}

export interface AppSettings {
  theme: 'dark' | 'light'
  lightThemeVariant: 'minimal' | 'soft' | 'premium'
  darkThemeVariant: 'default' | 'pure' | 'warm'
  language: 'en' | 'fr'
  profile: UserProfile
  scanPreferences: ScanPreferences
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  lightThemeVariant: 'minimal',
  darkThemeVariant: 'default',
  language: 'en',
  profile: {
    name: 'David',
    email: '',
    photoUrl: '',
    company: '',
    companyUrl: '',
    defaultIndustry: '',
  },
  scanPreferences: {
    maxCompetitors: 15,
    scanFrequency: 'manual',
    targetRegions: ['Global'],
    watchlist: [],
  },
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  updateProfile: (partial: Partial<UserProfile>) => void
  updateScanPreferences: (partial: Partial<ScanPreferences>) => void
  t: (key: string) => string
}

const SettingsContext = createContext<SettingsContextType | null>(null)

// Simple i18n
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.overview': 'Overview',
    'nav.competitors': 'Competitors',
    'nav.news': 'News Feed',
    'nav.analytics': 'Industry Analytics',
    'nav.alerts': 'Alerts',
    'nav.insights': 'AI Insights',
    'nav.mywatch': 'My Watch',
    'nav.settings': 'Settings',
    'welcome': 'Welcome back',
    'subtitle': "Here's what's happening with your competitive landscape",
    'viewing': 'Viewing:',
    'new_scan': 'New Scan',
    'scanning': 'Scanning...',
    'kpi.competitors': 'Active Competitors',
    'kpi.alerts': 'Critical Alerts',
    'kpi.insights': 'New Insights',
    'kpi.threat': 'Avg Threat Score',
    'kpi.tracked': 'Tracked',
    'kpi.attention': 'Requires attention',
    'kpi.today': 'Generated today',
    'kpi.average': 'Market average',
    'kpi.click': 'Click to view details →',
    'alerts.recent': 'Recent Alerts',
    'alerts.view_all': 'View all alerts →',
    'competitors.top': 'Top Competitors',
    'competitors.view_all': 'View all competitors →',
    'insights.title': 'AI-Generated Insights',
    'insights.view_all': 'View all insights →',
    'scan.title': 'New Industry Scan',
    'scan.description': 'Select an industry and optionally provide your company website for more targeted competitor analysis.',
    'scan.website': 'Company Website',
    'scan.industry': 'Industry',
    'scan.auto': '🔎 Auto-detect from URL',
    'scan.auto_hint': 'AI will auto-detect the industry and find direct competitors.',
    'scan.manual_hint': 'Provide a URL for targeted competitor analysis, or select an industry below.',
    'scan.auto_label': '(auto-detected from URL)',
    'scan.cancel': 'Cancel',
    'scan.start': 'Start Scan',
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.profile': 'Profile & Account',
    'settings.scan_prefs': 'Scan Preferences',
    'settings.max_competitors': 'Max Competitors per Scan',
    'settings.frequency': 'Scan Frequency',
    'settings.regions': 'Target Regions',
    'settings.watchlist': 'Watchlist',
    'settings.watchlist_hint': 'Companies to always include in scans',
    'settings.saved': 'Settings saved!',
    'settings.pro_badge': 'PRO',
    'pro_plan': 'Pro Plan',
    'free_plan': 'Free Plan',
  },
  fr: {
    'nav.overview': 'Aperçu',
    'nav.competitors': 'Compétiteurs',
    'nav.news': 'Nouvelles',
    'nav.analytics': 'Analytique Industrie',
    'nav.alerts': 'Alertes',
    'nav.insights': 'Insights IA',
    'nav.mywatch': 'Ma Veille',
    'nav.settings': 'Paramètres',
    'welcome': 'Bon retour',
    'subtitle': 'Voici ce qui se passe dans votre paysage concurrentiel',
    'viewing': 'Affichage :',
    'new_scan': 'Nouveau Scan',
    'scanning': 'Scan en cours...',
    'kpi.competitors': 'Compétiteurs Actifs',
    'kpi.alerts': 'Alertes Critiques',
    'kpi.insights': 'Nouveaux Insights',
    'kpi.threat': 'Score Menace Moy.',
    'kpi.tracked': 'Suivis',
    'kpi.attention': 'Attention requise',
    'kpi.today': "Générés aujourd'hui",
    'kpi.average': 'Moyenne du marché',
    'kpi.click': 'Cliquer pour voir les détails →',
    'alerts.recent': 'Alertes Récentes',
    'alerts.view_all': 'Voir toutes les alertes →',
    'competitors.top': 'Top Compétiteurs',
    'competitors.view_all': 'Voir tous les compétiteurs →',
    'insights.title': 'Insights Générés par IA',
    'insights.view_all': 'Voir tous les insights →',
    'scan.title': 'Nouveau Scan Industriel',
    'scan.description': "Sélectionnez une industrie et fournissez optionnellement le site web de votre compagnie pour une analyse ciblée.",
    'scan.website': 'Site Web de la Compagnie',
    'scan.industry': 'Industrie',
    'scan.auto': '🔎 Auto-détection depuis URL',
    'scan.auto_hint': "L'IA détectera automatiquement l'industrie et trouvera les compétiteurs directs.",
    'scan.manual_hint': "Fournissez un URL pour une analyse ciblée, ou sélectionnez une industrie ci-dessous.",
    'scan.auto_label': "(auto-détecté depuis URL)",
    'scan.cancel': 'Annuler',
    'scan.start': 'Démarrer le Scan',
    'settings.title': 'Paramètres',
    'settings.appearance': 'Apparence',
    'settings.theme': 'Thème',
    'settings.language': 'Langue',
    'settings.profile': 'Profil & Compte',
    'settings.scan_prefs': 'Préférences de Scan',
    'settings.max_competitors': 'Max Compétiteurs par Scan',
    'settings.frequency': 'Fréquence de Scan',
    'settings.regions': 'Régions Cibles',
    'settings.watchlist': 'Liste de Surveillance',
    'settings.watchlist_hint': 'Compagnies à toujours inclure dans les scans',
    'settings.saved': 'Paramètres sauvegardés !',
    'settings.pro_badge': 'PRO',
    'pro_plan': 'Plan Pro',
    'free_plan': 'Plan Gratuit',
  },
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage when user is available
  useEffect(() => {
    if (!user?.id) return
    
    try {
      const storageKey = `wyzelens_settings_${user.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed, profile: { ...defaultSettings.profile, ...parsed.profile }, scanPreferences: { ...defaultSettings.scanPreferences, ...parsed.scanPreferences } })
      }
    } catch (e) {}
    setLoaded(true)
  }, [user?.id])

  // Save to localStorage on change (scoped by user)
  useEffect(() => {
    if (loaded && user?.id) {
      const storageKey = `wyzelens_settings_${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(settings))
      // Apply theme
      const root = document.documentElement
      root.classList.toggle('light-theme', settings.theme === 'light')
      
      // Apply theme variants
      if (settings.theme === 'light') {
        root.setAttribute('data-light-variant', settings.lightThemeVariant)
      } else {
        root.setAttribute('data-dark-variant', settings.darkThemeVariant)
      }
    }
  }, [settings, loaded])

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
  }

  const updateProfile = (partial: Partial<UserProfile>) => {
    setSettings(prev => ({ ...prev, profile: { ...prev.profile, ...partial } }))
  }

  const updateScanPreferences = (partial: Partial<ScanPreferences>) => {
    setSettings(prev => ({ ...prev, scanPreferences: { ...prev.scanPreferences, ...partial } }))
  }

  const t = (key: string) => {
    return translations[settings.language]?.[key] || translations.en[key] || key
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateProfile, updateScanPreferences, t }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
