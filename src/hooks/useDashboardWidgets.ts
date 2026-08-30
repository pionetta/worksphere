import { useState, useEffect, useCallback } from 'react'

export type DashboardWidgetId =
  | 'balance_summary'
  | 'quick_actions'
  | 'habit_streaks'
  | 'todo_summary'
  | 'recurring_bills'
  | 'master_calendar_mini'
  | 'attendance_roster'

export interface DashboardWidgetConfig {
  id: DashboardWidgetId
  title: string
  description: string
  visible: boolean
  requiredPermission?: 'finance' | 'attendance' | 'todo'
}

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'balance_summary',
    title: 'Ringkasan Keuangan & Saldo',
    description: 'Menampilkan total saldo, pemasukan, dan pengeluaran bersih.',
    visible: true,
    requiredPermission: 'finance',
  },
  {
    id: 'quick_actions',
    title: 'Aksi Cepat & Navigasi',
    description: 'Pintasan navigasi langsung ke modul utama.',
    visible: true,
  },
  {
    id: 'habit_streaks',
    title: 'Kebiasaan Hari Ini (Habits)',
    description: 'Check-in cepat kebiasaan harian dan pantauan streak.',
    visible: true,
    requiredPermission: 'todo',
  },
  {
    id: 'todo_summary',
    title: 'Tugas Prioritas (To-Do)',
    description: 'Daftar tugas penting, terlambat, dan status penyelesaian.',
    visible: true,
    requiredPermission: 'todo',
  },
  {
    id: 'recurring_bills',
    title: 'Tagihan & Langganan Rutin',
    description: 'Pengingat tagihan berulang yang akan segera jatuh tempo.',
    visible: true,
    requiredPermission: 'finance',
  },
  {
    id: 'master_calendar_mini',
    title: 'Mini Kalender Terpadu',
    description: 'Jadwal dan agenda lintas modul untuk hari ini.',
    visible: true,
  },
  {
    id: 'attendance_roster',
    title: 'Presensi & Kehadiran Anggota',
    description: 'Rekap kehadiran anggota hari ini.',
    visible: true,
    requiredPermission: 'attendance',
  },
]

const STORAGE_KEY = 'worksphere_dashboard_widgets_v2'

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as DashboardWidgetConfig[]
        // Ensure all new default widgets exist in case stored array is older
        const savedIds = new Set(parsed.map(w => w.id))
        const missing = DEFAULT_DASHBOARD_WIDGETS.filter(w => !savedIds.has(w.id))
        return [...parsed, ...missing]
      }
    } catch {
      // Fallback
    }
    return DEFAULT_DASHBOARD_WIDGETS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
    } catch {
      // Storage error ignored
    }
  }, [widgets])

  const toggleWidget = useCallback((id: DashboardWidgetId, visible: boolean) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible } : w))
    )
  }, [])

  const moveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      if (toIndex < 0 || toIndex >= prev.length) return prev
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [])

  const resetDefaults = useCallback(() => {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage error ignored
    }
  }, [])

  return {
    widgets,
    toggleWidget,
    moveWidget,
    resetDefaults,
  }
}
