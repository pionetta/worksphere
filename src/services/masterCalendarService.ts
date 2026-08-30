import { db } from '@/lib/db'

export type CalendarModule = 'todo' | 'finance' | 'attendance'
export type CalendarEventType = 'task' | 'bill' | 'debt' | 'savings' | 'attendance'

export interface MasterCalendarEvent {
  id: string
  module: CalendarModule
  type: CalendarEventType
  title: string
  date: string // YYYY-MM-DD
  time?: string
  status?: string
  amount?: number
  priority?: string
  color: string
  icon?: string
  rawId: string
}

export async function getCalendarEventsForMonth(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<MasterCalendarEvent[]> {
  const monthStr = String(month).padStart(2, '0')
  const prefix = `${year}-${monthStr}`

  const events: MasterCalendarEvent[] = []

  // 1. Fetch To-Do Tasks
  const tasks = await db.tasks
    .where('user_id')
    .equals(userId)
    .toArray()

  for (const t of tasks) {
    if (t.deleted_at || !t.due_date) continue
    const taskDate = t.due_date.slice(0, 10)
    if (!taskDate.startsWith(prefix)) continue

    const isCompleted = t.status === 'completed'
    const color = isCompleted
      ? '#10B981'
      : t.priority === 'urgent'
      ? '#EF4444'
      : t.priority === 'high'
      ? '#F59E0B'
      : '#6366F1'

    events.push({
      id: `task-${t.id}`,
      rawId: t.id,
      module: 'todo',
      type: 'task',
      title: t.title,
      date: taskDate,
      time: t.due_date.length > 10 ? t.due_date.slice(11, 16) : undefined,
      status: t.status,
      priority: t.priority,
      color,
      icon: '✅',
    })
  }

  // 2. Fetch Recurring Transactions (Tagihan)
  const recurring = await db.recurring_transactions
    .where('user_id')
    .equals(userId)
    .toArray()

  for (const r of recurring) {
    if (!r.is_active || !r.next_due_date) continue
    if (!r.next_due_date.startsWith(prefix)) continue

    events.push({
      id: `recurring-${r.id}`,
      rawId: r.id,
      module: 'finance',
      type: 'bill',
      title: r.note || (r.type === 'income' ? 'Pemasukan Rutin' : 'Tagihan Rutin'),
      date: r.next_due_date,
      amount: r.amount,
      status: r.auto_record ? 'auto' : 'manual',
      color: r.type === 'income' ? '#059669' : '#E11D48',
      icon: '🔄',
    })
  }

  // 3. Fetch Debts (Utang / Piutang)
  const debts = await db.debts
    .where('user_id')
    .equals(userId)
    .toArray()

  for (const d of debts) {
    if (d.status === 'paid') continue

    // If installment with monthly due day, add monthly event
    if (d.is_installment && d.installment_due_day) {
      const dayStr = String(d.installment_due_day).padStart(2, '0')
      const installmentDate = `${prefix}-${dayStr}`
      events.push({
        id: `debt-inst-${d.id}-${installmentDate}`,
        rawId: d.id,
        module: 'finance',
        type: 'debt',
        title: `Cicilan ${d.person_name} (Tgl ${d.installment_due_day})`,
        date: installmentDate,
        amount: d.installment_amount || (d.amount - d.paid_amount),
        status: d.status,
        color: d.type === 'debt' ? '#DC2626' : '#2563EB',
        icon: '💳',
      })
    } else if (d.due_date && d.due_date.startsWith(prefix)) {
      events.push({
        id: `debt-${d.id}`,
        rawId: d.id,
        module: 'finance',
        type: 'debt',
        title: `${d.type === 'debt' ? 'Bayar Utang ke' : 'Tagih Piutang dari'} ${d.person_name}`,
        date: d.due_date,
        amount: d.amount - d.paid_amount,
        status: d.status,
        color: d.type === 'debt' ? '#DC2626' : '#2563EB',
        icon: '💸',
      })
    }
  }

  // 4. Fetch Savings Goals (Target Tabungan)
  const savings = await db.savings_goals
    .where('user_id')
    .equals(userId)
    .toArray()

  for (const s of savings) {
    if (!s.deadline || !s.deadline.startsWith(prefix)) continue
    events.push({
      id: `savings-${s.id}`,
      rawId: s.id,
      module: 'finance',
      type: 'savings',
      title: `Target Tabungan: ${s.name}`,
      date: s.deadline,
      amount: s.target_amount - s.current_amount,
      status: s.current_amount >= s.target_amount ? 'achieved' : 'in_progress',
      color: '#8B5CF6',
      icon: '🎯',
    })
  }

  // 5. Fetch Attendance Dates
  const attendance = await db.attendance
    .where('user_id')
    .equals(userId)
    .toArray()

  const attendanceDates = new Set<string>()
  for (const a of attendance) {
    if (a.attendance_date.startsWith(prefix) && a.status === 'present') {
      attendanceDates.add(a.attendance_date)
    }
  }

  for (const date of attendanceDates) {
    const presentCount = attendance.filter(
      a => a.attendance_date === date && a.status === 'present'
    ).length

    events.push({
      id: `attendance-${date}`,
      rawId: date,
      module: 'attendance',
      type: 'attendance',
      title: `Presensi: ${presentCount} Anggota Hadir`,
      date,
      status: 'present',
      color: '#3B82F6',
      icon: '👥',
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
