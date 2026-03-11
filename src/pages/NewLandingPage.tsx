import { Link } from 'react-router-dom'
import { 
  Shield, Zap, Target, TrendingUp, Bell, Lightbulb, 
  Eye, BarChart3, Globe, Sparkles, ArrowRight, 
  CheckCircle2, Menu, X, ChevronDown, Newspaper, RefreshCw
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const parallaxOffset = scrollY * 0.5

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-1">
                <img 
                  src="/logos/WyzeLensLogo.png" 
                  alt="WyzeLens" 
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                WyzeLens
              </span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <Link to="/blog" className="text-gray-300 hover:text-white transition">Blog</Link>
                <Link to="/sign-in" className="text-gray-300 hover:text-white transition">Sign In</Link>
                <Link 
                  to="/sign-up"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-300 hover:text-white transition">How it Works</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-white transition">Pricing</a>
              <Link to="/blog" className="block px-3 py-2 text-gray-300 hover:text-white transition">Blog</Link>
              <Link to="/sign-in" className="block px-3 py-2 text-gray-300 hover:text-white transition">Sign In</Link>
              <Link to="/sign-up" className="block px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Powered by Advanced AI Models</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text leading-tight">
              Know Your Competition<br />
              <span className="text-indigo-400">Before They Know You</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Competitive intelligence used to cost $50K/year and a full-time analyst. Now it takes 45 seconds. WyzeLens uses AI to monitor your industry and competitors 24/7 and deliver the insights that actually matter — pricing shifts, feature launches, positioning changes — straight to your dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/sign-up"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-indigo-500/50"
              >
                Start Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features"
                className="bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center gap-2 border border-slate-700"
              >
                See How It Works
                <ChevronDown className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hero Dashboard Mockup */}
          <div 
            className="relative mt-20"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4 bg-slate-900 rounded px-3 py-1 text-xs text-slate-500">
                  wyzelens.com/dashboard
                </div>
              </div>
              
              {/* Mockup content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Active Competitors', value: '12', icon: Target, color: 'indigo' },
                    { label: 'Critical Alerts', value: '3', icon: Bell, color: 'red' },
                    { label: 'New Insights', value: '8', icon: Lightbulb, color: 'yellow' },
                    { label: 'Threat Score', value: '7.8', icon: TrendingUp, color: 'green' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        <span className="text-xs text-slate-500">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>
                
                {/* Chart mockup */}
                <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Market Activity</h3>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                  </div>
                  <div className="h-32 flex items-end gap-2">
                    {[40, 60, 45, 80, 65, 90, 70, 85, 75, 95, 80, 88].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Stacked Layout */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Competitive Intelligence,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Automated</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stop manually tracking competitors. Let AI do the heavy lifting while you focus on strategy.
            </p>
          </div>

          {/* Feature 1 - Competitor Discovery */}
          <div 
            id="feature-1"
            ref={(el) => { sectionRefs.current['feature-1'] = el }}
            className={`mb-32 space-y-8 fade-in-section ${visibleSections.has('feature-1') ? 'animate-fade-in-up' : ''}`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-4">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">Automated Discovery</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Find Competitors Instantly</h3>
              <p className="text-gray-400 text-lg mb-6">
                AI automatically identifies and tracks both direct and emerging competitors in your market. 
                No manual research required—just enter your industry and let WyzeLens do the rest.
              </p>
              <ul className="space-y-3">
                {[
                  'Auto-detect competitors from industry',
                  'Track up to 100+ companies',
                  'Monitor funding rounds & acquisitions',
                  'Real-time intelligence updates'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl overflow-hidden">
                <div className="space-y-3">
                  {[
                    { name: 'Tesla Inc.', threat: 9.2, color: 'red' },
                    { name: 'Rivian Automotive', threat: 8.5, color: 'orange' },
                    { name: 'Lucid Motors', threat: 7.8, color: 'yellow' },
                    { name: 'BYD Company', threat: 7.2, color: 'green' }
                  ].map((comp, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{comp.name}</div>
                          <div className="text-xs text-slate-500">Electric Vehicles</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-${comp.color}-400 font-bold`}>{comp.threat}</div>
                          <div className="text-xs text-slate-500">Threat Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - AI Insights */}
          <div 
            id="feature-2"
            ref={(el) => { sectionRefs.current['feature-2'] = el }}
            className={`mb-32 space-y-8 fade-in-section ${visibleSections.has('feature-2') ? 'animate-fade-in-up delay-100' : ''}`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-4">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">AI-Powered Insights</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Strategic Intelligence in Seconds</h3>
              <p className="text-gray-400 text-lg mb-6">
                Transform raw data into actionable intelligence. Our AI analyzes thousands of data points 
                to surface threats, opportunities, and trends that matter to your business.
              </p>
              <ul className="space-y-3">
                {[
                  'AI-generated strategic insights',
                  'Threat & opportunity detection',
                  'Confidence scoring on predictions',
                  'Actionable recommendations'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl overflow-hidden">
                <div className="space-y-4">
                  {[
                    { 
                      title: 'Federal Transit Investment Surge',
                      type: 'opportunity',
                      confidence: 90
                    },
                    { 
                      title: 'Competitor Expanding Manufacturing',
                      type: 'threat',
                      confidence: 85
                    },
                    { 
                      title: 'New Market Trend: Urban Mobility',
                      type: 'trend',
                      confidence: 88
                    }
                  ].map((insight, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-purple-400 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{insight.title}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                              insight.type === 'threat' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {insight.type}
                            </span>
                            <span className="text-xs text-slate-500">{insight.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Intelligent Alerts */}
          <div 
            id="feature-3"
            ref={(el) => { sectionRefs.current['feature-3'] = el }}
            className={`mb-32 space-y-8 fade-in-section ${visibleSections.has('feature-3') ? 'animate-fade-in-up delay-200' : ''}`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-4">
                <Bell className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Intelligent Alerts</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Never Miss a Critical Move</h3>
              <p className="text-gray-400 text-lg mb-6">
                Get notified only when it matters. AI filters noise to surface critical competitive moves, 
                so you can respond fast when your competitors make a move.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time competitive alerts',
                  'Smart noise filtering',
                  'Priority-based notifications',
                  'Weekly digest summaries (coming soon)'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl overflow-hidden">
                <div className="space-y-3">
                  {[
                    { 
                      title: 'Competitor raised $50M Series C',
                      priority: 'critical',
                      time: '2 hours ago'
                    },
                    { 
                      title: 'New product launch detected',
                      priority: 'attention',
                      time: '5 hours ago'
                    },
                    { 
                      title: 'Market share shift in urban segment',
                      priority: 'info',
                      time: '1 day ago'
                    }
                  ].map((alert, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          alert.priority === 'critical' ? 'bg-red-400' :
                          alert.priority === 'attention' ? 'bg-yellow-400' :
                          'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{alert.title}</div>
                          <div className="text-xs text-slate-500">{alert.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 - News & Auto-Refresh */}
          <div 
            id="feature-4"
            ref={(el) => { sectionRefs.current['feature-4'] = el }}
            className={`space-y-8 fade-in-section ${visibleSections.has('feature-4') ? 'animate-fade-in-up delay-300' : ''}`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
                <Newspaper className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Always Up-to-Date</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Stay Fresh with Automated Monitoring</h3>
              <p className="text-gray-400 text-lg mb-6">
                Never work with stale data. WyzeLens continuously scans the web for the latest news, 
                product launches, and market movements—keeping your intelligence fresh 24/7.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time news aggregation from thousands of sources',
                  'Automated hourly/daily/weekly profile refreshes',
                  'Smart deduplication and ranking',
                  'Date-grouped news feed for easy scanning'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl overflow-hidden">
                <div className="space-y-3">
                  {[
                    { 
                      title: 'Tesla announces new battery technology',
                      source: 'TechCrunch',
                      time: '2 hours ago',
                      tag: 'Product'
                    },
                    { 
                      title: 'Rivian secures $2B partnership with Amazon',
                      source: 'Bloomberg',
                      time: '5 hours ago',
                      tag: 'Funding'
                    },
                    { 
                      title: 'BYD expands European market presence',
                      source: 'Reuters',
                      time: '1 day ago',
                      tag: 'Market'
                    }
                  ].map((news, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <Newspaper className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{news.title}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{news.time}</span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full ml-2">
                              {news.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Refresh indicator */}
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-sm text-slate-400">Auto-refresh scheduled: Tomorrow 9:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get Started in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> 3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-400">
              From setup to insights in under 3 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Globe,
                title: 'Enter Your Industry',
                description: 'Tell us your company and industry. Our AI does the rest—automatically discovering and tracking competitors.'
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI Analyzes Everything',
                description: 'We scan news, social media, funding data, and market signals 24/7 to build your industry intelligence dashboard.'
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Act on Insights',
                description: 'Get actionable insights, alerts, and recommendations. Make strategic decisions with confidence.'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 h-full">
                  <div className="text-6xl font-bold text-slate-800 mb-4">{step.step}</div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free, scale as you grow. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/forever',
                description: 'Perfect for getting started',
                features: [
                  '1 industry profile',
                  '5 competitors per scan',
                  '1 manual refresh/day',
                  'No automated refresh',
                  '7 days history',
                  'Email support'
                ],
                cta: 'Get Started',
                highlighted: false
              },
              {
                name: 'Starter',
                price: '$8',
                originalPrice: '$19',
                period: '/month',
                description: 'For individuals & freelancers',
                features: [
                  '3 industry profiles',
                  '10 competitors per scan',
                  '3 manual refreshes/day',
                  'Daily automated refresh',
                  '30 days history',
                  'Priority email support'
                ],
                cta: 'Get Started',
                highlighted: false
              },
              {
                name: 'Pro',
                price: '$20',
                originalPrice: '$29',
                period: '/month',
                description: 'For heavy users',
                features: [
                  '5 industry profiles',
                  '15 competitors per scan',
                  'Unlimited manual refreshes',
                  'Hourly automated refresh',
                  'Custom competitor watchlist',
                  'Regional filters',
                  '90 days history',
                  'Priority support'
                ],
                cta: 'Get Started',
                highlighted: true,
                badge: 'MOST POPULAR'
              },
              {
                name: 'Business',
                price: '$49',
                originalPrice: '$99',
                period: '/month',
                description: 'For businesses',
                features: [
                  '10 industry profiles',
                  'Unlimited competitors',
                  'Unlimited manual refreshes',
                  'Hourly automated refresh',
                  'Custom competitor watchlist',
                  'Regional filters',
                  'Unlimited history',
                  'Dedicated support',
                  'API access (soon)',
                  'Daily Digest (soon)',
                  'Slack Webhook (soon)',
                  'Email Alerts (soon)',
                  'Export Reports (soon)',
                ],
                cta: 'Get Started',
                highlighted: false
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations',
                features: [
                  'Unlimited industry profiles',
                  'Unlimited competitors',
                  'Unlimited manual refreshes',
                  'Hourly automated refresh',
                  'Custom competitor watchlist',
                  'Regional filters',
                  'Unlimited history',
                  'White-label reports',
                  'Dedicated account manager',
                  'Custom integrations',
                  'API access (soon)',
                  'Daily Digest (soon)',
                  'Slack Webhook (soon)',
                  'Email Alerts (soon)',
                  'Export Reports (soon)',
                ],
                cta: 'Contact Sales',
                highlighted: false
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-6 transition-all hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20'
                    : 'bg-slate-900/50 border border-slate-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  
                  {plan.originalPrice && (
                    <div className="mb-1">
                      <span className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        🚀 SPECIAL LAUNCH PRICE
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    {plan.originalPrice && (
                      <span className="text-2xl text-slate-500 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-slate-400">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <Link
                  to="/sign-up"
                  className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition mb-6 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-slate-400">
            <p>No credit card required to get started.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '94%+', label: 'Insight Relevance Rate' },
              { value: '6.8hrs+', label: 'Time Saved per User per Week' },
              { value: '45sec', label: 'Intelligence Refresh Time' },
              { value: '<3min', label: 'Setup Time' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Strategic Leaders
            </h2>
            <p className="text-xl text-gray-400">
              See how teams use WyzeLens to stay ahead
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "WyzeLens gave us the early warning we needed when our main competitor started pivoting. We adjusted our strategy 3 months ahead of the market—that's a game-changer.",
                author: "Sarah Chen",
                role: "VP Strategy",
                company: "TechVentures Inc.",
                avatar: "SC"
              },
              {
                quote: "I used to spend 6+ hours every Monday morning tracking competitors manually. Now WyzeLens does it automatically while I focus on execution. ROI paid for itself in week one.",
                author: "Marcus Rodriguez",
                role: "Product Director",
                company: "InnovateLabs",
                avatar: "MR"
              },
              {
                quote: "The AI insights are scary good. It flagged a funding round 2 days before TechCrunch reported it. We had our counter-positioning ready before anyone else even knew.",
                author: "Emily Park",
                role: "Founder & CEO",
                company: "NexusAI",
                avatar: "EP"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 hover:border-indigo-500/50 transition-all">
                <div className="mb-6">
                  <div className="text-indigo-400 text-5xl mb-4">"</div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-indigo-400">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powered by Premium Intelligence Sources
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI continuously scans thousands of trusted global sources to deliver 
              comprehensive, real-time competitive intelligence
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {[
                { name: 'Reuters', file: 'reuters.svg' },
                { name: 'Bloomberg', file: 'bloomberg.svg' },
                { name: 'IndustryWeek', file: 'industryweek.svg' },
                { name: 'Industry Today', file: 'industrytoday.svg' },
                { name: 'Fast Company', file: 'fastcompany.svg' },
                { name: 'Business Wire', file: 'businesswire.svg' },
                { name: 'Business Insider', file: 'businessinsider.svg' },
                { name: 'TechCrunch', file: 'techcrunch.svg' }
              ].map((source, i) => (
                <div key={i} className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300">
                  <img 
                    src={`/logos/${source.file}`} 
                    alt={source.name}
                    className="h-12 w-auto"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-slate-500 text-sm">
                + thousands of industry blogs, forums, social media, and regional news outlets worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Outsmart Your Competition?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join forward-thinking companies using WyzeLens to turn competitive intelligence into competitive advantage.
          </p>
          <Link 
            to="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-10 py-5 rounded-lg font-semibold text-xl transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/50"
          >
            Start Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-1">
                  <img 
                    src="/logos/WyzeLensLogo.png" 
                    alt="WyzeLens" 
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xl font-bold">WyzeLens</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered competitive intelligence platform that transforms market noise into strategic advantage.
              </p>
              <p className="text-sm text-slate-500">
                Powered by <span className="text-indigo-400 font-semibold">Labwyze Inc.</span>
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://labwyze.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Labwyze Inc.</a></li>
                <li><Link to="/sign-in" className="hover:text-white transition">Sign In</Link></li>
                <li><Link to="/sign-up" className="hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>© 2026 Labwyze Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
