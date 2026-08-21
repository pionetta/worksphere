import { Card } from '@/components/ui/Card'
import { Users, CheckCircle, XCircle, MinusCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AttendanceDashboardCardProps {
  present: number
  absent: number
  holiday: number
  unrecorded: number
  totalMembers: number
}

export function AttendanceDashboardCard({
  present,
  absent,
  holiday,
  unrecorded,
  totalMembers,
}: AttendanceDashboardCardProps) {
  const navigate = useNavigate()

  if (totalMembers === 0) {
    return (
      <Card
        glass
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/app/attendance')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success-light dark:bg-green-900/30">
            <Users className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Absensi</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada anggota</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      glass
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/app/attendance')}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-success-light dark:bg-green-900/30">
          <Users className="w-5 h-5 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Absensi Hari Ini</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge icon={CheckCircle} label="Hadir" value={present} color="text-success" />
            <StatusBadge icon={XCircle} label="Absen" value={absent} color="text-danger" />
            <StatusBadge icon={MinusCircle} label="Libur" value={holiday} color="text-warning" />
            {unrecorded > 0 && (
              <StatusBadge icon={Clock} label="Belum" value={unrecorded} color="text-gray-500" />
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
