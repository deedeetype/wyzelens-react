import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

export default function Demo() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              WyzeLens
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/sign-in" className="text-gray-300 hover:text-white transition">Sign In</Link>
              <Link 
                to="/sign-up"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-2 rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Play className="w-20 h-20 mx-auto mb-6 text-indigo-400" />
          <h1 className="text-5xl font-bold mb-6">See WyzeLens in Action</h1>
          <p className="text-xl text-gray-400 mb-8">
            Watch how WyzeLens transforms competitive intelligence from hours of manual research into instant, actionable insights.
          </p>
          
          <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center mb-8">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">Demo video coming soon</p>
            </div>
          </div>

          <Link 
            to="/sign-up"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            Try it Free — No Credit Card Required
          </Link>
        </div>
      </section>
    </div>
  )
}