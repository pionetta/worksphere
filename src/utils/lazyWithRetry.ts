import { lazy, type ComponentType } from 'react'

/**
 * Robust lazy import wrapper with automatic retry and cache-busting reload
 * Fixes "Failed to fetch dynamically imported module" errors after new deployments.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>,
  componentName: string = 'Component'
) {
  return lazy(async () => {
    const sessionKey = `worksphere_chunk_reload_${componentName}`
    const alreadyReloaded = sessionStorage.getItem(sessionKey) === 'true'

    try {
      const module = await factory()
      sessionStorage.removeItem(sessionKey)
      if ('default' in module) {
        return { default: module.default as T }
      }
      return { default: Object.values(module)[0] as T }
    } catch (error: any) {
      const isDynamicImportError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'TypeError'

      if (isDynamicImportError && !alreadyReloaded) {
        sessionStorage.setItem(sessionKey, 'true')
        window.location.reload()
        return new Promise(() => {}) // Hang until reload finishes
      }

      throw error
    }
  })
}
