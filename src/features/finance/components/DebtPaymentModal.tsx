import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/currency'
import { payDebtSchema } from '@/features/finance/schemas/debtSchema'
import { Coins, CheckCircle2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import type { Debt } from '@/types'

interface DebtPaymentModalProps {
  debt: Debt | null
  open: boolean
  onClose: () => void
  onPayment: (debtId: string, amount: number) => Promise<void>
}

export function DebtPaymentModal({ debt, open, onClose, onPayment }: DebtPaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!debt) return null

  const remaining = Math.max(0, debt.amount - debt.paid_amount)
  const isDebt = debt.type === 'debt'
  const oneInstallment = debt.installment_amount ? Math.min(remaining, debt.installment_amount) : 0

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
      await onPayment(debt.id, parsedAmount)
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

  const handlePayInstallment = () => {
    if (oneInstallment > 0) {
      setAmount(String(oneInstallment))
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
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Pihak:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {debt.person_name}
            </span>
          </div>
          {debt.is_installment && debt.installment_due_day && (
            <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <span>Skema Cicilan:</span>
              <span>Jatuh tempo tiap tgl {debt.installment_due_day}</span>
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
            <span className="text-primary-600 dark:text-primary-400">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Input amount */}
        <div className="space-y-2">
          <Input
            label="Nominal Pembayaran / Cicilan"
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
            {debt.is_installment && oneInstallment > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={handlePayInstallment}
                icon={<CreditCard className="w-4 h-4 text-indigo-500" />}
              >
                Bayar 1x Cicilan ({formatCurrency(oneInstallment)})
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={`w-full text-xs font-bold ${!debt.is_installment ? 'sm:col-span-2' : ''}`}
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
