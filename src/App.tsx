import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
)
const AttendancePage = lazy(() =>
  import('@/pages/AttendancePage').then(m => ({ default: m.AttendancePage }))
)
const FinancePage = lazy(() =>
  import('@/pages/FinancePage').then(m => ({ default: m.FinancePage }))
)
const TodoPage = lazy(() => import('@/pages/TodoPage').then(m => ({ default: m.TodoPage })))

function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat aplikasi"
      className="p-4 sm:p-6 space-y-4 max-w-md mx-auto animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-lg bg-gray-200 dark:bg-gray-700/80" />
          <div className="h-6 w-48 rounded-xl bg-gray-300 dark:bg-gray-600/80" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700/80" />
      </div>

      {/* Main Card Skeleton */}
      <div className="rounded-[26px] bg-white/80 dark:bg-gray-800/80 p-5 space-y-4 border border-white/80 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
        <div className="h-4 w-28 rounded-lg bg-gray-200 dark:bg-gray-700/80" />
        <div className="h-8 w-40 rounded-xl bg-gray-300 dark:bg-gray-600/80" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50" />
          <div className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50" />
        </div>
      </div>

      {/* Quick Action Grid Skeleton */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50" />
        ))}
      </div>

      {/* Detail Container Skeleton */}
      <div className="rounded-[26px] bg-white/80 dark:bg-gray-800/80 p-5 h-56 border border-white/80 dark:border-gray-700/50 animate-pulse" />
    </div>
  )
}

export function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  const { theme, setTheme } = useTheme()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Root Landing / Welcome Page */}
      <Route
        path="/"
        element={
          <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Utama">
            <Suspense fallback={<LoadingScreen />}>
              <LandingPage />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />}
      />

      {/* Protected Routes with App Shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout theme={theme} onThemeChange={setTheme} title="Worksphere" />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ErrorBoundary fallbackTitle="Kendala Memuat Dashboard">
              <Suspense fallback={<LoadingScreen />}>
                <DashboardPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="attendance"
          element={
            <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Presensi">
              <Suspense fallback={<LoadingScreen />}>
                <AttendancePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="finance"
          element={
            <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Keuangan">
              <Suspense fallback={<LoadingScreen />}>
                <FinancePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="todo"
          element={
            <ErrorBoundary fallbackTitle="Kendala Memuat Halaman To-Do">
              <Suspense fallback={<LoadingScreen />}>
                <TodoPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Route>

      {/* Default fallback redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
