import { useState, useCallback } from 'react'
import { QuickActionFAB } from './QuickActionFAB'
import { QuickActionMenu, type QuickActionType } from './QuickActionMenu'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { AttendanceQuickAction } from './flows/AttendanceQuickAction'
import { IncomeQuickAction } from './flows/IncomeQuickAction'
import { ExpenseQuickAction } from './flows/ExpenseQuickAction'
import { TransferQuickAction } from './flows/TransferQuickAction'
import { TaskQuickAction } from './flows/TaskQuickAction'

import { toast } from 'sonner'

interface QuickActionsProps {
  userId: string
  onActionComplete: () => void
}

export function QuickActions({ userId, onActionComplete }: QuickActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<QuickActionType | null>(null)

  const handleFABClick = useCallback(() => {
    setMenuOpen(prev => !prev)
    setActiveAction(null)
  }, [])

  const handleSelect = useCallback((type: QuickActionType) => {
    setMenuOpen(false)
    setActiveAction(type)
  }, [])

  const handleClose = useCallback(() => {
    setActiveAction(null)
  }, [])

  const handleSuccess = useCallback(() => {
    if (activeAction === 'attendance') toast.success('Absensi hari ini berhasil dicatat!')
    if (activeAction === 'income') toast.success('Pemasukan berhasil dicatat!')
    if (activeAction === 'expense') toast.success('Pengeluaran berhasil dicatat!')
    if (activeAction === 'transfer') toast.success('Transfer antar dompet berhasil!')
    if (activeAction === 'task') toast.success('Tugas baru berhasil ditambahkan!')
    setActiveAction(null)
    onActionComplete()
  }, [activeAction, onActionComplete])

  const actionTitles: Record<QuickActionType, string> = {
    attendance: 'Catat Absensi Hari Ini',
    income: 'Tambah Pemasukan',
    expense: 'Tambah Pengeluaran',
    transfer: 'Transfer',
    task: 'Tambah Task',
  }

  return (
    <>
      <QuickActionFAB onClick={handleFABClick} open={menuOpen} />
      <QuickActionMenu open={menuOpen} onSelect={handleSelect} onClose={() => setMenuOpen(false)} />
      <BottomSheet
        open={activeAction !== null}
        onClose={handleClose}
        title={activeAction ? actionTitles[activeAction] : undefined}
      >
        {activeAction === 'attendance' && (
          <AttendanceQuickAction userId={userId} onSuccess={handleSuccess} onCancel={handleClose} />
        )}
        {activeAction === 'income' && (
          <IncomeQuickAction userId={userId} onSuccess={handleSuccess} onCancel={handleClose} />
        )}
        {activeAction === 'expense' && (
          <ExpenseQuickAction userId={userId} onSuccess={handleSuccess} onCancel={handleClose} />
        )}
        {activeAction === 'transfer' && (
          <TransferQuickAction userId={userId} onSuccess={handleSuccess} onCancel={handleClose} />
        )}
        {activeAction === 'task' && (
          <TaskQuickAction userId={userId} onSuccess={handleSuccess} onCancel={handleClose} />
        )}
      </BottomSheet>
    </>
  )
}
