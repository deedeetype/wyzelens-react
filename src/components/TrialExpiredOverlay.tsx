import { Crown, Lock, Zap, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TrialExpiredOverlayProps {
  onUpgrade: () => void
  onClose?: () => void
}

export default function TrialExpiredOverlay({ onUpgrade, onClose }: TrialExpiredOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Free Trial Has Ended
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          You've experienced the power of WyzeLens. Upgrade now to continue tracking your competitors and stay ahead of the market.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Real-time Alerts</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Crown className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Unlimited Insights</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Automated Refresh</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onUpgrade}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center gap-2 shadow-lg"
          >
            <Crown className="w-5 h-5" />
            Upgrade Now
          </button>
          
          <Link
            to="/pricing"
            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
          >
            View Plans
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Starting at just $39/month
        </p>
      </div>
    </div>
  )
}
