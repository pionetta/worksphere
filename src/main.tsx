import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

// Register Service Worker for PWA
registerSW({ immediate: true })

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
