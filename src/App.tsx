import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { Loader2 } from 'lucide-react'

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
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
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

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
