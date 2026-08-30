import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/currency'
import { payDebtSchema } from '@/features/finance/schemas/debtSchema'
import { getInstallmentProgress } from '@/features/finance/services/debtService'
import { Coins, CheckCircle2, CreditCard, RefreshCw, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { Debt } from '@/types'

interface DebtPaymentModalProps {
  debt: Debt | null
  open: boolean
  onClose: () => void
  onPayment: (debtId: string, amount: number, incrementInstallment?: boolean) => Promise<void>
}

export function DebtPaymentModal({ debt, open, onClose, onPayment }: DebtPaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inst = debt ? getInstallmentProgress(debt) : null
  const remaining = debt ? Math.max(0, debt.amount - debt.paid_amount) : 0
  const isDebt = debt?.type === 'debt'
  const monthlyBill = inst ? Math.min(remaining, inst.currentBillAmount) : 0

  useEffect(() => {
    if (open && debt) {
      if (monthlyBill > 0) {
        setAmount(String(monthlyBill))
      } else {
        setAmount('')
      }
      setError('')
    }
  }, [open, debt, monthlyBill])

  if (!debt) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseInt(amount, 10)

    const result = payDebtSchema.safeParse({ amount: parsedAmount })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Nominal tidak valid')
      return
    }

    if (parsedAmount > remaining) {
      setError(`Nominal tidak boleh melebihi sisa tagihan (${formatCurrency(remaining)})`)
      return
    }

    setLoading(true)
    try {
      await onPayment(debt.id, parsedAmount, Boolean(debt.is_installment))
      toast.success(
        isDebt
          ? `Pembayaran utang ke "${debt.person_name}" berhasil dicatat!`
          : `Penerimaan piutang dari "${debt.person_name}" berhasil dicatat!`
      )
      setAmount('')
      setError('')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mencatat pembayaran'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePayFull = () => {
    setAmount(String(remaining))
    setError('')
  }

  const handlePayMonthlyBill = () => {
    if (monthlyBill > 0) {
      setAmount(String(monthlyBill))
      setError('')
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isDebt ? 'Bayar / Cicil Utang' : 'Catat Pelunasan Piutang'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-2">
        {/* Info card */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 space-y-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Pihak / Catatan:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {debt.person_name}
            </span>
          </div>

          {inst && (
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                <span className="flex items-center gap-1.5">
                  {inst.isFlexible ? <RefreshCw className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                  Membayar Angsuran ke-{inst.currentInstallmentIndex} dari {inst.totalCount}
                </span>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  Sisa {inst.remainingCount}x lagi
                </span>
              </div>
              {debt.installment_due_day && (
                <div className="flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                  <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Jatuh tempo setiap <strong>tanggal {debt.installment_due_day}</strong></span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Tagihan:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(debt.amount)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Sudah Dibayar:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(debt.paid_amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Sisa yang harus dibayar:</span>
            <span className="text-primary-600 dark:text-primary-400 font-bold">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Input amount */}
        <div className="space-y-2">
          <Input
            label={
              inst?.isFlexible
                ? 'Nominal Pembayaran / Tagihan Bulan Ini (Rp)'
                : 'Nominal Pembayaran / Cicilan (Rp)'
            }
            type="number"
            value={amount}
            onChange={e => {
              setAmount(e.target.value)
              if (error) setError('')
            }}
            error={error}
            placeholder="0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {inst && monthlyBill > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={handlePayMonthlyBill}
                icon={inst.isFlexible ? <RefreshCw className="w-4 h-4 text-indigo-500" /> : <CreditCard className="w-4 h-4 text-indigo-500" />}
              >
                {inst.isFlexible ? 'Tagihan Bulan Ini' : '1x Angsuran'} ({formatCurrency(monthlyBill)})
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={`w-full text-xs font-bold ${!inst ? 'sm:col-span-2' : ''}`}
              onClick={handlePayFull}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            >
              Lunasi Semua ({formatCurrency(remaining)})
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} icon={<Coins className="w-4 h-4" />}>
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
