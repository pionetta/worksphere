import { useState, useEffect, useCallback } from 'react'
import * as financeSummaryService from '@/features/finance/services/financeSummaryService'
import * as walletBalanceService from '@/features/finance/services/walletBalanceService'
import * as transactionService from '@/features/finance/services/transactionService'
import * as attendanceService from '@/features/attendance/services/attendanceService'
import * as memberService from '@/features/attendance/services/memberService'
import * as taskStatsService from '@/features/todo/services/taskStatsService'
import * as taskRepo from '@/features/todo/repositories/taskRepository'
import { toISODate } from '@/utils/date'

export interface DashboardData {
  finance: {
    totalBalance: number
    totalIncome: number
    totalExpense: number
    walletCount: number
    recentTransactions?: Array<{
      id: string
      type: string
      amount: number
      note?: string | null
      transaction_date: string
    }>
  }
  attendance: {
    present: number
    absent: number
    holiday: number
    unrecorded: number
    totalMembers: number
    members?: Array<{
      id: string
      name: string
      status: string
    }>
  }
  todo: {
    total: number
    todo: number
    inProgress: number
    completed: number
    overdue: number
    tasks?: Array<{
      id: string
      title: string
      priority: string
      due_date?: string | null
      status: string
    }>
  }
}

export function useDashboard(userId: string | null) {
  const [data, setData] = useState<DashboardData>({
    finance: { totalBalance: 0, totalIncome: 0, totalExpense: 0, walletCount: 0 },
    attendance: { present: 0, absent: 0, holiday: 0, unrecorded: 0, totalMembers: 0 },
    todo: { total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const today = toISODate(new Date())
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const [financeSummary, wallets, rawTransactions, members, attendance, tasks, allTasks] =
        await Promise.all([
          financeSummaryService.getFinanceSummaryByMonth(userId, currentMonth, currentYear),
          walletBalanceService.getAllWalletBalances(userId),
          transactionService.getTransactions(userId).catch(() => []),
          memberService.getAllMembers(userId),
          attendanceService.getAttendanceForDate(userId, today),
          taskStatsService.getTaskStats(userId),
          taskRepo.listTasks(userId).catch(() => []),
        ])

      const activeMembers = members.filter(m => m.is_active)
      const activeMemberIds = new Set(activeMembers.map(m => m.id))
      const totalMembers = activeMembers.length

      const activeAttendance = attendance.filter(a => activeMemberIds.has(a.member_id))
      const present = activeAttendance.filter(a => a.status === 'present').length
      const absent = activeAttendance.filter(a => a.status === 'absent').length
      const holiday = activeAttendance.filter(a => a.status === 'holiday').length
      const unrecorded = Math.max(0, totalMembers - activeAttendance.length)

      const recentTransactions = [...rawTransactions]
        .sort(
          (a, b) =>
            b.transaction_date.localeCompare(a.transaction_date) ||
            b.created_at.localeCompare(a.created_at)
        )
        .slice(0, 4)

      const membersList = activeMembers.slice(0, 5).map(m => {
        const record = activeAttendance.find(a => a.member_id === m.id)
        return {
          id: m.id,
          name: m.name,
          status: record?.status || 'unrecorded',
        }
      })

      const activeTaskList = allTasks
        .filter(t => t.status !== 'completed')
        .slice(0, 4)
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          due_date: t.due_date,
          status: t.status,
        }))

      setData({
        finance: {
          totalBalance: financeSummary.totalBalance,
          totalIncome: financeSummary.totalIncome,
          totalExpense: financeSummary.totalExpense,
          walletCount: wallets.length,
          recentTransactions,
        },
        attendance: {
          present,
          absent,
          holiday,
          unrecorded: Math.max(0, unrecorded),
          totalMembers,
          members: membersList,
        },
        todo: {
          total: tasks.total,
          todo: tasks.todo,
          inProgress: tasks.inProgress,
          completed: tasks.completed,
          overdue: tasks.overdue,
          tasks: activeTaskList,
        },
      })
    } catch {
      setError('Gagal memuat data dashboard. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
