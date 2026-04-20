import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { getUserPlan, getPlanLimits, checkTrialAccess, type PlanName } from '@/lib/subscription'

export function useSubscription() {
  const { user } = useUser()
  const [plan, setPlan] = useState<PlanName>('free')
  const [loading, setLoading] = useState(true)
  const [trialExpired, setTrialExpired] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(7)

  useEffect(() => {
    async function loadPlan() {
      if (!user?.id) {
        setPlan('free')
        setLoading(false)
        return
      }

      try {
        const userPlan = await getUserPlan(user.id)
        setPlan(userPlan)
        
        // Check trial status for free users using email (ANTI-ABUSE)
        if (userPlan === 'free') {
          // Get primary email from Clerk
          const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress
          
          if (!userEmail) {
            console.error('[useSubscription] No email found for user')
            setTrialExpired(true)
            setTrialDaysRemaining(0)
            return
          }
          
          const trialStatus = await checkTrialAccess(user.id, userEmail)
          setTrialExpired(trialStatus.trialExpired)
          setTrialDaysRemaining(trialStatus.daysRemaining)
        }
      } catch (error) {
        console.error('Error loading plan:', error)
        setPlan('free')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [user?.id, user?.primaryEmailAddress?.emailAddress])

  const limits = getPlanLimits(plan)

  return {
    plan,
    limits,
    loading,
    trialExpired,
    trialDaysRemaining,
    isFreePlan: plan === 'free',
    isStarterPlan: plan === 'starter',
    isProPlan: plan === 'pro',
    isBusinessPlan: plan === 'business',
    isEnterprisePlan: plan === 'enterprise',
  }
}
