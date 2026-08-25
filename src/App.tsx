import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { Loader2 } from 'lucide-react'
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
      className="min-h-dvh flex flex-col bg-gradient-to-b from-[#E2EFFC] via-[#EDF5FD] to-[#DCEBFA] dark:from-[#0b1329] dark:via-[#0f172a] dark:to-[#0b1329] px-4 py-4 max-w-md mx-auto w-full space-y-4"
    >
      <span className="sr-only">Memuat...</span>
      {/* Topbar Skeleton */}
      <div className="flex items-center justify-between h-14 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 animate-pulse border border-white/60 dark:border-gray-700/50" />
          <div className="w-32 h-5 rounded-full bg-white/80 dark:bg-gray-800/80 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-gray-800/80 animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-gray-800/80 animate-pulse" />
        </div>
      </div>

      {/* Main Card Skeleton */}
      <div className="rounded-[24px] bg-white/80 dark:bg-gray-800/80 p-6 space-y-4 shadow-sm border border-white/80 dark:border-gray-700/50 animate-pulse h-48" />

      {/* 2-Col Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-[22px] bg-white/80 dark:bg-gray-800/80 p-5 h-28 border border-white/80 dark:border-gray-700/50 animate-pulse" />
        <div className="rounded-[22px] bg-white/80 dark:bg-gray-800/80 p-5 h-28 border border-white/80 dark:border-gray-700/50 animate-pulse" />
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
          <Suspense fallback={<LoadingScreen />}>
            <LandingPage />
          </Suspense>
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
            <Suspense fallback={<LoadingScreen />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="attendance"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <AttendancePage />
            </Suspense>
          }
        />
        <Route
          path="finance"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <FinancePage />
            </Suspense>
          }
        />
        <Route
          path="todo"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <TodoPage />
            </Suspense>
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
