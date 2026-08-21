import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionDetail } from './TransactionDetail'
import type { Transaction } from '@/types'

const mockTransaction: Transaction = {
  id: 'tx-1',
  user_id: 'user-1',
  wallet_id: 'wallet-1',
  type: 'income',
  amount: 5000000,
  category_id: 'cat-1',
  transaction_date: '2026-08-20',
  note: 'Gaji bulan Agustus',
  transfer_group_id: null,
  deleted_at: null,
  created_at: '2026-08-20T10:00:00Z',
  updated_at: '2026-08-20T10:00:00Z',
}

describe('TransactionDetail', () => {
  it('should not render when transaction is null', () => {
    const { container } = render(<TransactionDetail transaction={null} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render transaction details correctly', () => {
    render(
      <TransactionDetail
        transaction={mockTransaction}
        categoryName="Gaji"
        walletName="BCA"
        onClose={vi.fn()}
      />
    )

    // Using regex to match formatted currency and date
    expect(screen.getByText(/\+Rp\s*5\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText('Pemasukan')).toBeInTheDocument() // Badge label
    expect(screen.getByText('Gaji')).toBeInTheDocument()
    expect(screen.getByText('BCA')).toBeInTheDocument()
    expect(screen.getByText('Gaji bulan Agustus')).toBeInTheDocument()
    expect(screen.getByText('tx-1...')).toBeInTheDocument() // Truncated ID
  })

  it('should render negative prefix for expense', () => {
    const expenseTx = { ...mockTransaction, type: 'expense' as const, amount: 50000 }
    render(<TransactionDetail transaction={expenseTx} onClose={vi.fn()} />)
    expect(screen.getByText(/-Rp\s*50\.000/)).toBeInTheDocument()
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    const onClose = vi.fn()
    render(<TransactionDetail transaction={mockTransaction} onClose={onClose} onEdit={onEdit} />)

    const editBtn = screen.getByRole('button', { name: /Edit/i })
    await userEvent.click(editBtn)

    expect(onClose).toHaveBeenCalled()
    expect(onEdit).toHaveBeenCalledWith(mockTransaction)
  })

  it('should call onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    const onClose = vi.fn()
    render(
      <TransactionDetail transaction={mockTransaction} onClose={onClose} onDelete={onDelete} />
    )

    const deleteBtn = screen.getByRole('button', { name: /Hapus/i })
    await userEvent.click(deleteBtn)

    expect(onClose).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(mockTransaction.id)
  })

  it('should not show edit button for non-editable types (transfer)', () => {
    const transferTx = { ...mockTransaction, type: 'transfer_in' as const }
    render(<TransactionDetail transaction={transferTx} onClose={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument()
  })
})
