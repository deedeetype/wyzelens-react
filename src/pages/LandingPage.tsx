import { Link } from 'react-router-dom'
import { 
  Shield, Zap, Target, TrendingUp, Bell, Lightbulb, 
  Play, CheckCircle, ArrowRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                WyzeLens
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/demo" className="text-gray-300 hover:text-white transition">Demo</Link>
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
              <Link to="/demo" className="block px-3 py-2 text-gray-300 hover:text-white transition">Demo</Link>
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
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Powered by Advanced AI Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text">
            Know Your Competition<br />Before They Know You
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            WyzeLens delivers real-time competitive intelligence that transforms market noise into strategic advantage. 
            Stay ahead with AI-powered insights, automated monitoring, and predictive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/sign-up"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/demo"
              className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center gap-2 border border-slate-700"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Competitive Intelligence, Automated</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Stop manually tracking competitors. Let AI do the heavy lifting while you focus on strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Competitor Discovery",
                description: "AI automatically identifies and tracks both direct and emerging competitors in your market."
              },
              {
                icon: TrendingUp,
                title: "Market Movement Tracking",
                description: "Real-time monitoring of funding rounds, product launches, partnerships, and strategic shifts."
              },
              {
                icon: Bell,
                title: "Intelligent Alerts",
                description: "Get notified only when it matters. AI filters noise to surface critical competitive moves."
              },
              {
                icon: Lightbulb,
                title: "Strategic Insights",
                description: "Transform raw data into actionable intelligence with AI-powered analysis and recommendations."
              },
              {
                icon: Shield,
                title: "Threat Assessment",
                description: "Quantify competitive threats with proprietary scoring algorithms and predictive modeling."
              },
              {
                icon: Zap,
                title: "Instant Reports",
                description: "Generate comprehensive competitive analysis reports in seconds, not hours."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition">
                <feature.icon className="w-12 h-12 text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Outsmart Your Competition?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join forward-thinking companies using WyzeLens to turn competitive intelligence into competitive advantage.
          </p>
          <Link 
            to="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}