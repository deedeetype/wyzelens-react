import { AlertTriangle, Clock, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TrialBannerProps {
  trialExpired: boolean
  daysRemaining: number
  onUpgrade: () => void
}

export default function TrialBanner({ trialExpired, daysRemaining, onUpgrade }: TrialBannerProps) {
  if (trialExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Your 7-day free trial has expired</p>
              <p className="text-sm text-red-600">Upgrade to continue tracking competitors and insights</p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </button>
        </div>
      </div>
    )
  }

  // Warning banner when trial is ending soon (< 3 days)
  if (daysRemaining <= 3) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                {daysRemaining === 0 ? 'Last day of your free trial' : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in your free trial`}
              </p>
              <p className="text-sm text-amber-600">Upgrade now to keep your competitive intelligence flowing</p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </button>
        </div>
      </div>
    )
  }

  // Subtle info banner for remaining days (4-7 days)
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            {daysRemaining} days remaining in your free trial
          </p>
        </div>
        <Link
          to="/pricing"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
        >
          View Plans
        </Link>
      </div>
    </div>
  )
}
