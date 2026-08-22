import { useAuth } from '@/lib/auth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDashboard } from '@/hooks/useDashboard'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { AttendanceDashboardCard } from '@/components/dashboard/AttendanceDashboardCard'
import { FinanceDashboardCard } from '@/components/dashboard/FinanceDashboardCard'
import { TodoDashboardCard } from '@/components/dashboard/TodoDashboardCard'
import { QuickActions } from '@/components/dashboard/QuickActions'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function formatDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const network = useNetworkStatus()
  const { data, loading, error, refresh } = useDashboard(user?.id ?? null)

  const emailPrefix = user?.email?.split('@')[0] ?? 'User'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {emailPrefix}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatDate()}</p>
        {network === 'offline' && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Offline — perubahan akan disinkronkan saat online.
          </p>
        )}
      </div>

      {/* Feature Summary Cards */}
      <div className="space-y-3">
        {loading ? (
          <>
            <Card glass className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </Card>
            <Card glass className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </Card>
            <Card glass className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </Card>
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <>
            <AttendanceDashboardCard
              present={data.attendance.present}
              absent={data.attendance.absent}
              holiday={data.attendance.holiday}
              unrecorded={data.attendance.unrecorded}
              totalMembers={data.attendance.totalMembers}
            />
            <FinanceDashboardCard
              totalBalance={data.finance.totalBalance}
              totalIncome={data.finance.totalIncome}
              totalExpense={data.finance.totalExpense}
              walletCount={data.finance.walletCount}
            />
            <TodoDashboardCard
              total={data.todo.total}
              inProgress={data.todo.inProgress}
              completed={data.todo.completed}
              overdue={data.todo.overdue}
            />
          </>
        )}
      </div>

      {/* Quick Actions FAB */}
      {user?.id && <QuickActions userId={user.id} onActionComplete={refresh} />}
    </div>
  )
}
