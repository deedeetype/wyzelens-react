import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { Check, Crown, Zap, Shield, Mail } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { plan: currentPlan } = useSubscription()
  const [loading, setLoading] = useState('')
  
  // Dynamic CTA text based on current plan
  const getButtonText = (planId: string, isPaidPlan: boolean) => {
    // Not logged in
    if (!user) {
      return isPaidPlan ? 'Start 14-day Trial' : 'Start Free'
    }
    
    // Current plan
    if (currentPlan === planId) {
      return 'Current Plan'
    }
    
    // Enterprise (always contact sales)
    if (planId === 'enterprise') {
      return 'Contact Sales'
    }
    
    // Free plan
    if (planId === 'free') {
      return currentPlan === 'free' ? 'Current Plan' : 'Cancel Required'
    }
    
    // Paid plans - dynamic switch text
    const planName = planId.charAt(0).toUpperCase() + planId.slice(1)
    return `Switch to ${planName}`
  }
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      description: 'Perfect for getting started',
      features: [
        '1 industry profile',
        '5 competitors per scan',
        '1 manual refresh/day',
        'Weekly automated refresh',
        '7 days history',
        'Email support'
      ],
      cta: 'Start Free',
      href: '/sign-up',
      highlighted: false,
      planId: 'free'
    },
    {
      name: 'Starter',
      price: '$8',
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
      cta: 'Start 14-day Trial',
      href: '/sign-up',
      highlighted: false,
      planId: 'starter'
    },
    {
      name: 'Pro',
      price: '$20',
      period: '/month',
      description: 'For growing teams',
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
      cta: 'Start 14-day Trial',
      href: '/sign-up',
      highlighted: true,
      planId: 'pro'
    },
    {
      name: 'Business',
      price: '$49',
      period: '/month',
      description: 'For established businesses',
      features: [
        '10 industry profiles',
        'Unlimited competitors',
        'Unlimited manual refreshes',
        'Hourly automated refresh',
        'Custom competitor watchlist',
        'Regional filters',
        'Unlimited history',
        'Dedicated support',
        'API access (soon)'
      ],
      cta: 'Start 14-day Trial',
      href: '/sign-up',
      highlighted: false,
      planId: 'business'
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
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@labwyze.com',
      highlighted: false,
      planId: 'enterprise'
    }
  ]

  const handleSelectPlan = async (planId: string, href: string) => {
    // Enterprise: Open email
    if (planId === 'enterprise') {
      window.location.href = href
      return
    }
    
    // Not logged in: Go to sign up
    if (!user) {
      navigate(href)
      return
    }
    
    // 🚫 Block manual downgrade to Free (must cancel via Stripe Portal)
    if (planId === 'free' && currentPlan !== 'free') {
      alert('To return to the Free plan, please cancel your paid subscription from Settings → Manage Subscription.\n\nYour paid features will remain active until the end of your current billing period.')
      return
    }
    
    // Free plan: Go to dashboard (only if already free)
    if (planId === 'free') {
      navigate('/dashboard')
      return
    }
    
    // Paid plans: Stripe checkout
    setLoading(planId)
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        },
        body: JSON.stringify({
          planId: planId,
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
  }

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
              {user ? (
                <Link 
                  to="/dashboard"
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" className="text-slate-400 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link 
                    to="/sign-up"
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 mb-4">
            Start free, scale as you grow
          </p>
          <p className="text-sm text-slate-500">
            All paid plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.planId}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/50'
                  : 'bg-slate-900 border border-slate-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-slate-400">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.planId, plan.href)}
                disabled={
                  loading === plan.planId || 
                  currentPlan === plan.planId ||
                  (plan.planId === 'free' && currentPlan !== 'free')
                }
                className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-6 ${
                  currentPlan === plan.planId
                    ? 'bg-green-600 cursor-default'
                    : plan.highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                } ${
                  (loading === plan.planId || currentPlan === plan.planId || (plan.planId === 'free' && currentPlan !== 'free'))
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {loading === plan.planId 
                  ? 'Loading...' 
                  : getButtonText(plan.planId, plan.planId !== 'free' && plan.planId !== 'enterprise')
                }
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ or CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Not sure which plan is right for you?</h2>
        <p className="text-slate-400 mb-8">
          Start with the Free plan and upgrade anytime as your needs grow.
        </p>
        <a
          href="mailto:david.laborieux@labwyze.com"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          <Mail className="w-5 h-5" />
          Contact Sales
        </a>
      </div>
    </div>
  )
}
