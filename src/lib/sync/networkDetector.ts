// ─── Network Status ───────────────────────────────────────────────────────────

export type NetworkStatus = 'online' | 'offline'

export function getNetworkStatus(): NetworkStatus {
  return navigator.onLine ? 'online' : 'offline'
}

export function isOnline(): boolean {
  return navigator.onLine
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

type NetworkCallback = () => void

const listeners: Set<NetworkCallback> = new Set()

function handleOnline(): void {
  for (const listener of listeners) {
    listener()
  }
}

function handleOffline(): void {
  for (const listener of listeners) {
    listener()
  }
}

let initialized = false

function ensureInitialized(): void {
  if (initialized) return
  initialized = true

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}

export function onNetworkChange(callback: NetworkCallback): () => void {
  ensureInitialized()
  listeners.add(callback)

  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && initialized) {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      initialized = false
    }
  }
}

// ─── Wait for Online ──────────────────────────────────────────────────────────

export function waitForOnline(timeoutMs?: number): Promise<void> {
  if (isOnline()) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    const cleanup = onNetworkChange(() => {
      if (isOnline()) {
        cleanup()
        resolve()
      }
    })

    if (timeoutMs !== undefined) {
      setTimeout(() => {
        cleanup()
        resolve()
      }, timeoutMs)
    }
  })
}
