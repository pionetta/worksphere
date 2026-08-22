import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let standalone = false
    try {
      if (typeof window.matchMedia === 'function') {
        standalone = window.matchMedia('(display-mode: standalone)')?.matches ?? false
      }
      if (!standalone && (window.navigator as unknown as { standalone?: boolean })?.standalone) {
        standalone = true
      }
    } catch {
      standalone = false
    }
    setIsInstalled(standalone)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPwa = async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setDeferredPrompt(null)
        return true
      }
    } catch {
      // Ignored
    }
    return false
  }

  return {
    canInstall: !isInstalled && !!deferredPrompt,
    isInstalled,
    installPwa,
  }
}
