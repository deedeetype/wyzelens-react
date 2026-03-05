import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { getUserPlan, getPlanLimits, type PlanName } from '@/lib/subscription'

export function useSubscription() {
  const { user } = useUser()
  const [plan, setPlan] = useState<PlanName>('free')
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error loading plan:', error)
        setPlan('free')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [user?.id])

  const limits = getPlanLimits(plan)

  return {
    plan,
    limits,
    loading,
    isFreePlan: plan === 'free',
    isStarterPlan: plan === 'starter',
    isProPlan: plan === 'pro',
    isBusinessPlan: plan === 'business',
    isEnterprisePlan: plan === 'enterprise',
  }
}
