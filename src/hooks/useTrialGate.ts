import { useState } from 'react'
import { useSubscription } from './useSubscription'

type ProtectedAction = 'new_scan' | 'refresh' | 'share' | 'export'

export function useTrialGate() {
  const { isFreePlan, trialExpired } = useSubscription()
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [blockedAction, setBlockedAction] = useState<ProtectedAction | null>(null)

  /**
   * Check if the user can perform the action
   * Returns true if allowed, false if blocked (and shows modal)
   */
  const checkTrialAccess = (action: ProtectedAction): boolean => {
    // Paid users always have access
    if (!isFreePlan) {
      return true
    }

    // Free users with active trial can proceed
    if (!trialExpired) {
      return true
    }

    // Free users with expired trial are blocked
    setBlockedAction(action)
    setShowTrialModal(true)
    return false
  }

  const closeTrialModal = () => {
    setShowTrialModal(false)
    setBlockedAction(null)
  }

  return {
    checkTrialAccess,
    showTrialModal,
    closeTrialModal,
    blockedAction,
    isBlocked: isFreePlan && trialExpired
  }
}
