import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, Eye } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  image: string
}

const blogPosts: BlogPost[] = [
  {
    slug: 'best-competitive-intelligence-tools-2026',
    title: 'Best Competitive Intelligence Tools 2026',
    excerpt: 'An in-depth comparison of the top 10 competitive intelligence platforms helping businesses stay ahead in 2026.',
    author: 'WyzeLens Team',
    date: 'February 15, 2026',
    readTime: '8 min read',
    category: 'Tools & Guides',
    image: '/blog-images/best-ci-tools-2026.jpg'
  },
  {
    slug: 'crayon-vs-klue-vs-wyzelens',
    title: 'Crayon vs Klue vs WyzeLens: Which CI Tool is Right for You?',
    excerpt: 'A detailed head-to-head comparison of three leading competitive intelligence platforms in 2026.',
    author: 'WyzeLens Team',
    date: 'February 8, 2026',
    readTime: '10 min read',
    category: 'Comparisons',
    image: '/blog-images/crayon-klue-wyzelens.jpg'
  },
  {
    slug: 'how-to-track-competitors-with-ai',
    title: 'How to Track Markets and Competitors with AI',
    excerpt: 'Learn how AI-powered tools are transforming competitive intelligence—from automation to predictive insights.',
    author: 'WyzeLens Team',
    date: 'January 22, 2026',
    readTime: '7 min read',
    category: 'AI & Strategy',
    image: '/blog-images/ai-competitor-tracking.jpg'
  }
]

export default function BlogList() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                WyzeLens
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-white transition">
                Home
              </Link>
              <Link to="/pricing" className="text-slate-400 hover:text-white transition">
                Pricing
              </Link>
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

      {/* Hero */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            WyzeLens Blog
          </h1>
          <p className="text-xl text-slate-400">
            Insights on competitive intelligence, AI-powered market tracking, and strategic advantage
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Eye className="w-16 h-16 text-slate-700" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition">
                  {post.title}
                </h2>

                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 pb-32 text-center">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Competitive Intelligence?
          </h2>
          <p className="text-slate-400 mb-8">
            Join forward-thinking teams using WyzeLens to stay ahead of the competition.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            Start Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 Labwyze Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
