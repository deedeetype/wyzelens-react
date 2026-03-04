import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { supabase } from '@/lib/supabase'
import { INDUSTRIES } from '@/constants/industries'
import { 
  Briefcase, 
  Globe, 
  Target, 
  ArrowRight, 
  Check,
  Sparkles,
  Building2
} from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [companyName, setCompanyName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [competitorCount, setCompetitorCount] = useState('5')
  const [regions, setRegions] = useState<string[]>(['Global'])
  
  const totalSteps = 3
  
  const handleComplete = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Update user metadata in Clerk
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboarded: true,
          onboardingData: {
            companyName,
            companyUrl,
            industry,
            competitorCount: parseInt(competitorCount),
            regions
          }
        }
      })
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }
  
  const canProceed = () => {
    switch (step) {
      case 1:
        return companyName.trim().length > 0
      case 2:
        return industry.length > 0
      case 3:
        return true
      default:
        return false
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Welcome to WyzeLens</h1>
            <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Tell us about your company</h2>
                <p className="text-slate-400">This helps us provide more accurate competitive intelligence</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Helps us find your direct competitors
                </p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Select your industry</h2>
                <p className="text-slate-400">We'll monitor competitors and news in this space</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Primary Industry *
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select an industry...</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                <p className="text-indigo-300 text-sm">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Don't worry! You can create additional industry profiles later to track multiple markets.
                </p>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Customize your monitoring</h2>
                <p className="text-slate-400">Fine-tune how we track your competitive landscape</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Number of competitors to track
                </label>
                <select
                  value={competitorCount}
                  onChange={(e) => setCompetitorCount(e.target.value)}
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="3">Top 3 competitors</option>
                  <option value="5">Top 5 competitors</option>
                  <option value="10">Top 10 competitors</option>
                  <option value="15">Top 15 competitors</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Geographic focus
                </label>
                <div className="space-y-2">
                  {['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America'].map(region => (
                    <label key={region} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                      <input
                        type="checkbox"
                        checked={regions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRegions([...regions, region])
                          } else {
                            setRegions(regions.filter(r => r !== region))
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-700"
                      />
                      <span className="text-white">{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 text-slate-400 hover:text-white transition disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 transition flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading || !canProceed()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              user?.update({
                unsafeMetadata: {
                  ...user.unsafeMetadata,
                  onboarded: true
                }
              }).then(() => navigate('/dashboard'))
            }}
            className="text-sm text-slate-500 hover:text-slate-400 transition"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}