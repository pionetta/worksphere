import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Register Service Worker for PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration error:', err)
    })
  })
}

// Automatically recover from stale dynamic import chunks on new deployments
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    const lastReload = sessionStorage.getItem('worksphere_preload_reload')
    const now = Date.now()
    if (!lastReload || now - Number(lastReload) > 5000) {
      sessionStorage.setItem('worksphere_preload_reload', String(now))
      window.location.reload()
    }
  })
}

// Apply initial theme before render to prevent flash
const stored = localStorage.getItem('worksphere-theme')
const theme = stored === 'dark' || stored === 'light' ? stored : 'system'
const isDark =
  theme === 'dark' ||
  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
if (isDark) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
