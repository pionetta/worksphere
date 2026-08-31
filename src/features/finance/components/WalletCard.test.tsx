import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard } from './WalletCard'
import type { WalletWithBalance } from '@/types'

const mockWallet: WalletWithBalance = {
  id: 'wallet-1',
  user_id: 'user-1',
  name: 'Dompet Utama',
  type: 'bank',
  initial_balance: 100000,
  balance: 150000,
  is_active: true,
  note: 'Tabungan',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('WalletCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render wallet info correctly', () => {
    const onSelect = vi.fn()
    render(<WalletCard wallet={mockWallet} onSelect={onSelect} />)

    expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    expect(screen.getByText('Bank')).toBeInTheDocument()
    expect(screen.getByText('Rp150.000')).toBeInTheDocument()
    expect(screen.getByText('Tabungan')).toBeInTheDocument()
    expect(screen.getByText('Aktif')).toBeInTheDocument()
  })

  it('should call onSelect when card is clicked', async () => {
    const onSelect = vi.fn()
    render(<WalletCard wallet={mockWallet} onSelect={onSelect} />)

    const card =
      screen.getByText('Dompet Utama').closest('[role="button"]') ||
      screen.getByText('Dompet Utama').closest('div')
    if (card) {
      await userEvent.click(card)
    }

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should show deactivate button when onDeactivate is provided', () => {
    const onDeactivate = vi.fn()
    render(<WalletCard wallet={mockWallet} onDeactivate={onDeactivate} />)

    expect(screen.getByLabelText('Nonaktifkan dompet Dompet Utama')).toBeInTheDocument()
  })

  it('should not show deactivate button when onDeactivate is not provided', () => {
    render(<WalletCard wallet={mockWallet} />)

    expect(screen.queryByLabelText(/Nonaktifkan dompet/)).not.toBeInTheDocument()
  })

  it('should call onDeactivate with wallet id when deactivate button is clicked', async () => {
    const onDeactivate = vi.fn()
    const onSelect = vi.fn()
    render(<WalletCard wallet={mockWallet} onDeactivate={onDeactivate} onSelect={onSelect} />)

    const deactivateButton = screen.getByLabelText('Nonaktifkan dompet Dompet Utama')
    await userEvent.click(deactivateButton)

    expect(onDeactivate).toHaveBeenCalledWith('wallet-1')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should show inactive badge for inactive wallet', () => {
    const inactiveWallet = { ...mockWallet, is_active: false }
    render(<WalletCard wallet={inactiveWallet} />)

    expect(screen.getByText('Nonaktif')).toBeInTheDocument()
  })

  it('should show note when wallet has note', () => {
    render(<WalletCard wallet={mockWallet} />)

    expect(screen.getByText('Tabungan')).toBeInTheDocument()
  })

  it('should not show note when wallet has no note', () => {
    const walletWithoutNote = { ...mockWallet, note: null }
    render(<WalletCard wallet={walletWithoutNote} />)

    expect(screen.queryByText('Tabungan')).not.toBeInTheDocument()
  })

  it('should trigger onTransfer when transfer button is clicked', async () => {
    const onTransfer = vi.fn()
    const onSelect = vi.fn()
    render(<WalletCard wallet={mockWallet} onTransfer={onTransfer} onSelect={onSelect} />)

    const transferButton = screen.getByLabelText('Transfer dana dari Dompet Utama')
    await userEvent.click(transferButton)

    expect(onTransfer).toHaveBeenCalledWith('wallet-1')
    expect(onSelect).not.toHaveBeenCalled()
  })
})
