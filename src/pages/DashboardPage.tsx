import { useAuth } from '@/lib/auth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDashboard } from '@/hooks/useDashboard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/skeleton'
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'User'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {getGreeting()}, {displayName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatDate()}</p>
        {network === 'offline' && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Offline — perubahan akan disinkronkan saat online.
          </p>
        )}
      </div>

      {/* Feature Summary Cards */}
      <div className="space-y-3">
        {loading ? (
          <>
            <Card glass className="animate-pulse p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </Card>
            <Card glass className="animate-pulse p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </Card>
            <Card glass className="animate-pulse p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </Card>
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <>
            <div className="animate-fade-in-up">
              <AttendanceDashboardCard
                present={data.attendance.present}
                absent={data.attendance.absent}
                holiday={data.attendance.holiday}
                unrecorded={data.attendance.unrecorded}
                totalMembers={data.attendance.totalMembers}
              />
            </div>
            <div className="animate-fade-in-up animation-delay-100">
              <FinanceDashboardCard
                totalBalance={data.finance.totalBalance}
                totalIncome={data.finance.totalIncome}
                totalExpense={data.finance.totalExpense}
                walletCount={data.finance.walletCount}
              />
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <TodoDashboardCard
                total={data.todo.total}
                inProgress={data.todo.inProgress}
                completed={data.todo.completed}
                overdue={data.todo.overdue}
              />
            </div>
          </>
        )}
      </div>

      {/* Quick Actions FAB */}
      {user?.id && <QuickActions userId={user.id} onActionComplete={refresh} />}
    </div>
  )
}
