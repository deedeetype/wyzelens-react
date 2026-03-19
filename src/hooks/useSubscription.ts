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
        
        // Check trial status for free users using Clerk createdAt
        if (userPlan === 'free') {
          // Clerk provides createdAt as Date object - convert to timestamp
          const userCreatedAt = user.createdAt ? user.createdAt.getTime() : Date.now()
          const trialStatus = await checkTrialAccess(user.id, userCreatedAt)
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
  }, [user?.id, user?.createdAt])

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
