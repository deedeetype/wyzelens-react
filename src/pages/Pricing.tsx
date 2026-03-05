import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { Check, Crown, Zap, Shield } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { plan: currentPlan } = useSubscription()
  const [loading, setLoading] = useState('')
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '1 industry profile',
        'Basic competitor tracking',
        'Weekly updates',
        'Email alerts',
        'Community support'
      ],
      cta: 'Start Free',
      href: '/sign-up',
      highlighted: false,
      planId: 'free'
    },
    {
      name: 'Starter',
      price: '$49',
      description: 'For small teams',
      features: [
        '1 industry profile',
        'Advanced competitor tracking',
        'Daily updates',
        'Priority email alerts',
        'Email support',
        'Export reports'
      ],
      cta: 'Start Trial',
      href: '/sign-up',
      highlighted: false,
      planId: 'starter'
    },
    {
      name: 'Pro',
      price: '$149',
      description: 'For growing businesses',
      features: [
        '3 industry profiles',
        'Full competitor intelligence',
        'Real-time updates',
        'Smart alerts',
        'API access',
        'Custom reports',
        'Priority support'
      ],
      cta: 'Start Trial',
      href: '/sign-up',
      highlighted: true,
      planId: 'pro'
    },
    {
      name: 'Business',
      price: '$399',
      description: 'For enterprises',
      features: [
        '10 industry profiles',
        'Advanced analytics',
        'Predictive insights',
        'White-label reports',
        'Dedicated support',
        'Custom integrations',
        'Team collaboration'
      ],
      cta: 'Contact Sales',
      href: '/sign-up',
      highlighted: false,
      planId: 'business'
    }
  ]

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

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. All plans include our core competitive intelligence features.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-indigo-900/40 to-purple-900/40 border-indigo-500 transform scale-105'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                {currentPlan === plan.planId && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  {plan.price !== '$0' && <span className="text-lg text-gray-400">/month</span>}
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.planId === 'free' || !user ? (
                  <Link
                    to={plan.href}
                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={async () => {
                      if (loading) return
                      setLoading(plan.planId)
                      
                      try {
                        const response = await fetch('/.netlify/functions/create-checkout-session', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-user-email': user.primaryEmailAddress?.emailAddress || '',
                          },
                          body: JSON.stringify({
                            planId: plan.planId,
                            userId: user.id,
                          }),
                        })
                        
                        const data = await response.json()
                        
                        if (data.url) {
                          window.location.href = data.url
                        } else {
                          throw new Error('No checkout URL received')
                        }
                      } catch (error) {
                        console.error('Checkout error:', error)
                        alert('Failed to start checkout. Please try again.')
                        setLoading('')
                      }
                    }}
                    disabled={loading === plan.planId}
                    className={`w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.planId ? 'Loading...' : plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}