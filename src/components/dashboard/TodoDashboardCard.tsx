import { Card } from '@/components/ui/Card'
import { ListTodo, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TodoDashboardCardProps {
  total: number
  inProgress: number
  completed: number
  overdue: number
}

export function TodoDashboardCard({
  total,
  inProgress,
  completed,
  overdue,
}: TodoDashboardCardProps) {
  const navigate = useNavigate()

  if (total === 0) {
    return (
      <Card
        glass
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/app/todo')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning-light dark:bg-amber-900/30">
            <ListTodo className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">To-Do</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada tugas</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      glass
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/app/todo')}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-warning-light dark:bg-amber-900/30">
          <ListTodo className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">To-Do</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge
              icon={ListTodo}
              label="Total"
              value={total}
              color="text-gray-700 dark:text-gray-300"
            />
            <StatusBadge
              icon={Clock}
              label="Dikerjakan"
              value={inProgress}
              color="text-primary-500"
            />
            <StatusBadge
              icon={CheckCircle}
              label="Selesai"
              value={completed}
              color="text-success"
            />
            {overdue > 0 && (
              <StatusBadge
                icon={AlertTriangle}
                label="Terlambat"
                value={overdue}
                color="text-danger"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatusBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  )
}
