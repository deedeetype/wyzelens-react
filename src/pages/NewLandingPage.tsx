import { Link } from 'react-router-dom'
import { 
  Shield, Zap, Target, TrendingUp, Bell, Lightbulb, 
  Eye, BarChart3, Globe, Sparkles, ArrowRight, 
  CheckCircle2, Menu, X, ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const parallaxOffset = scrollY * 0.5

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                WyzeLens
              </span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
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
              <Link to="/pricing" className="block px-3 py-2 text-gray-300 hover:text-white transition">Pricing</Link>
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
              <span className="text-sm text-indigo-300">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text leading-tight">
              Know Your Competition<br />
              <span className="text-indigo-400">Before They Know You</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time competitive intelligence that transforms market noise into strategic advantage. 
              AI-powered insights, automated monitoring, and predictive analytics—all in one platform.
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

      {/* Features Section with Parallax */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Competitive Intelligence,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Automated</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stop manually tracking competitors. Let AI do the heavy lifting while you focus on strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
            {/* Feature 1 */}
            <div 
              className="order-2 md:order-1"
              style={{ transform: `translateX(${parallaxOffset * -0.3}px)` }}
            >
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
                  'Real-time profile updates'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div 
              className="order-1 md:order-2"
              style={{ transform: `translateX(${parallaxOffset * 0.3}px)` }}
            >
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
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

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
            <div 
              style={{ transform: `translateX(${parallaxOffset * -0.3}px)` }}
            >
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
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

            <div 
              style={{ transform: `translateX(${parallaxOffset * 0.3}px)` }}
            >
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
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div 
              className="order-2 md:order-1"
              style={{ transform: `translateX(${parallaxOffset * -0.3}px)` }}
            >
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
                  'Weekly digest summaries'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div 
              className="order-1 md:order-2"
              style={{ transform: `translateX(${parallaxOffset * 0.3}px)` }}
            >
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
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
              From setup to insights in under 5 minutes
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
                description: 'We scan news, social media, funding data, and market signals 24/7 to build your competitive intelligence dashboard.'
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

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Companies Tracked' },
              { value: '500K+', label: 'Data Points Daily' },
              { value: '99.9%', label: 'Uptime Reliability' },
              { value: '<5min', label: 'Setup Time' }
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
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
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
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
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
