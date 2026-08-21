import { useState, useEffect } from 'react'
import { getNetworkStatus, onNetworkChange, type NetworkStatus } from '@/lib/sync/networkDetector'

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus)

  useEffect(() => {
    const unsubscribe = onNetworkChange(() => {
      setStatus(getNetworkStatus())
    })

    return unsubscribe
  }, [])

  return status
}
