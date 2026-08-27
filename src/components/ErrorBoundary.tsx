import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Error in React Component Tree:', error, errorInfo)

    // Automatically recover from stale chunks after new deployments
    const isChunkLoadFailed =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Loading chunk')

    if (isChunkLoadFailed) {
      const lastReload = sessionStorage.getItem('worksphere_eb_chunk_reload')
      const now = Date.now()
      if (!lastReload || now - Number(lastReload) > 5000) {
        sessionStorage.setItem('worksphere_eb_chunk_reload', String(now))
        window.location.reload()
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/app'
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-1.5">
            {this.props.fallbackTitle || 'Terjadi Kendala pada Halaman Ini'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
            {this.state.error?.message ||
              'Aplikasi mengalami kendala teknis saat merender halaman. Silakan muat ulang atau kembali ke beranda.'}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={this.handleReload}
              icon={<RotateCw className="w-4 h-4" />}
            >
              Muat Ulang
            </Button>
            <Button
              size="sm"
              onClick={this.handleGoHome}
              icon={<Home className="w-4 h-4" />}
            >
              Ke Beranda
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
