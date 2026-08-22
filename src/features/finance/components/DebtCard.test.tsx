import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebtCard } from './DebtCard'
import type { Debt } from '@/types'

const mockDebt: Debt = {
  id: 'debt-1',
  user_id: 'user-1',
  type: 'debt',
  person_name: 'Pak Hendra',
  amount: 1000000,
  paid_amount: 400000,
  due_date: '2026-12-31',
  status: 'partially_paid',
  note: 'Pinjaman alat kantor',
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
}

describe('DebtCard', () => {
  it('should render debt person name and remaining amount', () => {
    render(<DebtCard debt={mockDebt} />)

    expect(screen.getByText('Pak Hendra')).toBeInTheDocument()
    expect(screen.getByText('Saya Berutang')).toBeInTheDocument()
    expect(screen.getByText('Pinjaman alat kantor')).toBeInTheDocument()
  })

  it('should trigger onPay callback when pay button clicked', async () => {
    const onPay = vi.fn()
    render(<DebtCard debt={mockDebt} onPay={onPay} />)

    const payBtn = screen.getByRole('button', { name: 'Bayar atau cicil' })
    await userEvent.click(payBtn)

    expect(onPay).toHaveBeenCalledTimes(1)
  })

  it('should render receivable badge for receivable type', () => {
    const mockReceivable: Debt = {
      ...mockDebt,
      type: 'receivable',
      person_name: 'Andi',
      status: 'unpaid',
      paid_amount: 0,
    }

    render(<DebtCard debt={mockReceivable} />)
    expect(screen.getByText('Piutang')).toBeInTheDocument()
    expect(screen.getByText('Andi')).toBeInTheDocument()
  })
})
