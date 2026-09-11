import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FinanceSummary } from './FinanceSummary'

describe('FinanceSummary Interactive Features', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders total balance and toggles privacy on balance row click', async () => {
    render(
      <FinanceSummary
        totalBalance={7500000}
        totalIncome={10000000}
        totalExpense={2500000}
        netIncome={7500000}
        month={9}
        year={2026}
      />
    )

    // Initial state: shows balance
    expect(screen.getByText('Rp7.500.000')).toBeInTheDocument()
    expect(screen.getByText('+Rp10.000.000')).toBeInTheDocument()
    expect(screen.getByText('-Rp2.500.000')).toBeInTheDocument()

    // Click the balance row (has title 'Klik untuk sembunyikan saldo')
    const balanceBtn = screen.getByTitle('Klik untuk sembunyikan saldo')
    await userEvent.click(balanceBtn)

    // Hidden state: obfuscated
    expect(screen.getByText('••••••••')).toBeInTheDocument()
    expect(screen.getByText('+••••')).toBeInTheDocument()
    expect(screen.getByText('-••••')).toBeInTheDocument()

    // Click again to reveal
    const revealBtn = screen.getByTitle('Klik untuk tampilkan saldo')
    await userEvent.click(revealBtn)
    expect(screen.getByText('Rp7.500.000')).toBeInTheDocument()
  })

  it('triggers onTypeFilterChange when Pemasukan or Pengeluaran is clicked', async () => {
    const handleFilterChange = vi.fn()

    const { rerender } = render(
      <FinanceSummary
        totalBalance={1000000}
        totalIncome={1500000}
        totalExpense={500000}
        netIncome={1000000}
        month={9}
        year={2026}
        activeTypeFilter="all"
        onTypeFilterChange={handleFilterChange}
      />
    )

    // Click Pemasukan
    const incomeBtn = screen.getByRole('button', { name: /pemasukan/i })
    await userEvent.click(incomeBtn)
    expect(handleFilterChange).toHaveBeenCalledWith('income')

    // Rerender with activeTypeFilter='income'
    rerender(
      <FinanceSummary
        totalBalance={1000000}
        totalIncome={1500000}
        totalExpense={500000}
        netIncome={1000000}
        month={9}
        year={2026}
        activeTypeFilter="income"
        onTypeFilterChange={handleFilterChange}
      />
    )

    // Click Pemasukan again to toggle off -> 'all'
    await userEvent.click(incomeBtn)
    expect(handleFilterChange).toHaveBeenCalledWith('all')

    // Click Pengeluaran
    const expenseBtn = screen.getByRole('button', { name: /pengeluaran/i })
    await userEvent.click(expenseBtn)
    expect(handleFilterChange).toHaveBeenCalledWith('expense')
  })

  it('opens Quick Month Selector Picker when month pill is clicked', async () => {
    const handleMonthChange = vi.fn()

    render(
      <FinanceSummary
        totalBalance={1000000}
        totalIncome={1500000}
        totalExpense={500000}
        netIncome={1000000}
        month={9}
        year={2026}
        onMonthChange={handleMonthChange}
      />
    )

    // Click Month pill
    const monthPill = screen.getByRole('button', { name: /pilih periode bulan & tahun/i })
    await userEvent.click(monthPill)

    // Modal title should appear
    expect(screen.getByText('Pilih Periode Bulan & Tahun')).toBeInTheDocument()

    // Click 'Oktober'
    const octBtn = screen.getByRole('button', { name: /oktober/i })
    await userEvent.click(octBtn)

    expect(handleMonthChange).toHaveBeenCalledWith(10, 2026)
  })

  it('renders carousel slides for Total Saldo Kas and individual wallets with pagination dots', async () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
      { id: 'w2', name: 'Dompet Tunai', type: 'cash' as const, balance: 500000, income: 200000, expense: 100000 },
      { id: 'w3', name: 'GoPay', type: 'e_wallet' as const, balance: 250000, income: 300000, expense: 50000 },
    ]

    render(
      <FinanceSummary
        totalBalance={3750000}
        totalIncome={5500000}
        totalExpense={2150000}
        netIncome={3350000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    // Total Saldo Kas slide + 3 wallet slides = 4 slides
    expect(screen.getByText('Total Saldo Kas')).toBeInTheDocument()
    expect(screen.getByText('BCA')).toBeInTheDocument()
    expect(screen.getByText('Dompet Tunai')).toBeInTheDocument()
    expect(screen.getByText('GoPay')).toBeInTheDocument()

    // 4 pagination dots rendered outside the cards
    expect(screen.getByRole('button', { name: 'Slide 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Slide 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Slide 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Slide 4' })).toBeInTheDocument()

    // Balance values rendered
    expect(screen.getByText('Rp3.750.000')).toBeInTheDocument()
    expect(screen.getByText('Rp3.000.000')).toBeInTheDocument()
    expect(screen.getByText('Rp500.000')).toBeInTheDocument()
    expect(screen.getByText('Rp250.000')).toBeInTheDocument()
  })

  it('switches active card when tapping peeking card in the Wallet Stack', async () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
      { id: 'w2', name: 'Dompet Tunai', type: 'cash' as const, balance: 500000, income: 200000, expense: 100000 },
    ]

    render(
      <FinanceSummary
        totalBalance={3500000}
        totalIncome={5200000}
        totalExpense={2100000}
        netIncome={3100000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    // Initial indicator shows "(1/3)"
    expect(screen.getByText('(1/3)')).toBeInTheDocument()
    expect(screen.getByText('Semua Kas')).toBeInTheDocument()

    // Tap on BCA peeking card
    const bcaCard = screen.getByRole('button', { name: /pilih kartu BCA/i })
    await userEvent.click(bcaCard)

    // Now active card is BCA (2/3)
    expect(screen.getByText('(2/3)')).toBeInTheDocument()
  })

  it('switches active card on Swipe Up gesture', async () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
      { id: 'w2', name: 'Dompet Tunai', type: 'cash' as const, balance: 500000, income: 200000, expense: 100000 },
    ]

    const { container } = render(
      <FinanceSummary
        totalBalance={3500000}
        totalIncome={5200000}
        totalExpense={2100000}
        netIncome={3100000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    // Initially active is "Semua Kas" / Slide 1
    const dot1 = screen.getByRole('button', { name: 'Slide 1' })
    expect(dot1).toHaveClass('bg-indigo-600')

    // Find the active draggable card (the one with z-20)
    const activeCard = container.querySelector('[data-active-card="true"]')!
    expect(activeCard).toBeInTheDocument()

    // Simulate drag swipe up: pointerDown at (100, 200), pointerMove to (100, 100) -> dy = -100 (< -70)
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.pointerDown(activeCard, { clientX: 100, clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(activeCard, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(activeCard, { clientX: 100, clientY: 100, pointerId: 1 })

    // Wait for exit transition (200ms)
    const { waitFor } = await import('@testing-library/react')
    await waitFor(() => {
      // Should now advance to Slide 2
      const dot2 = screen.getByRole('button', { name: 'Slide 2' })
      expect(dot2).toHaveClass('bg-indigo-600')
    })
  })

  it('switches active card on Swipe Left and Swipe Right gestures', async () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
      { id: 'w2', name: 'Dompet Tunai', type: 'cash' as const, balance: 500000, income: 200000, expense: 100000 },
    ]

    const { container } = render(
      <FinanceSummary
        totalBalance={3500000}
        totalIncome={5200000}
        totalExpense={2100000}
        netIncome={3100000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    const { fireEvent, waitFor } = await import('@testing-library/react')
    const activeCard = container.querySelector('[data-active-card="true"]')!

    // Swipe Left: dx = -100 (< -70) -> Advances to Slide 2
    fireEvent.pointerDown(activeCard, { clientX: 200, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(activeCard, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(activeCard, { clientX: 100, clientY: 100, pointerId: 1 })

    await waitFor(() => {
      const dot2 = screen.getByRole('button', { name: 'Slide 2' })
      expect(dot2).toHaveClass('bg-indigo-600')
    })

    // Now Swipe Right: dx = +100 (> 70) -> Moves back to Slide 1
    const activeCardAfter = container.querySelector('[data-active-card="true"]')!
    fireEvent.pointerDown(activeCardAfter, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(activeCardAfter, { clientX: 200, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(activeCardAfter, { clientX: 200, clientY: 100, pointerId: 1 })

    await waitFor(() => {
      const dot1 = screen.getByRole('button', { name: 'Slide 1' })
      expect(dot1).toHaveClass('bg-indigo-600')
    })
  })

  it('renders all cards with full structure and absolute stacking layers', () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
      { id: 'w2', name: 'Dompet Tunai', type: 'cash' as const, balance: 500000, income: 200000, expense: 100000 },
    ]

    const { container } = render(
      <FinanceSummary
        totalBalance={3500000}
        totalIncome={5200000}
        totalExpense={2100000}
        netIncome={3100000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    // Check fixed height wrapper container
    const wrapper = container.querySelector('.h-\\[225px\\]')
    expect(wrapper).toBeInTheDocument()

    // Active Card (depth 0)
    const activeCard = container.querySelector('[data-depth="0"]')!
    expect(activeCard).toBeInTheDocument()
    expect(activeCard).toHaveClass('absolute', 'inset-0', 'min-h-[210px]', 'rounded-3xl')

    // Back Card 1 (depth 1)
    const backCard1 = container.querySelector('[data-depth="1"]')!
    expect(backCard1).toBeInTheDocument()
    expect(backCard1).toHaveClass('absolute', 'inset-0', 'min-h-[210px]', 'rounded-3xl', 'z-20')

    // Back Card 2 (depth 2)
    const backCard2 = container.querySelector('[data-depth="2"]')!
    expect(backCard2).toBeInTheDocument()
    expect(backCard2).toHaveClass('absolute', 'inset-0', 'min-h-[210px]', 'rounded-3xl', 'z-10')

    // Back cards contain full balance and income/expense details
    expect(backCard1).toHaveTextContent('BCA')
    expect(backCard1).toHaveTextContent('Rp3.000.000')
    expect(backCard1).toHaveTextContent('+Rp5.000.000')
    expect(backCard1).toHaveTextContent('-Rp2.000.000')

    expect(backCard2).toHaveTextContent('Dompet Tunai')
    expect(backCard2).toHaveTextContent('Rp500.000')
    expect(backCard2).toHaveTextContent('+Rp200.000')
    expect(backCard2).toHaveTextContent('-Rp100.000')
  })

  it('opens Card Customization modal on palette button click and saves new visual style', async () => {
    const mockWallets = [
      { id: 'w1', name: 'BCA', type: 'bank' as const, balance: 3000000, income: 5000000, expense: 2000000 },
    ]

    render(
      <FinanceSummary
        totalBalance={3000000}
        totalIncome={5000000}
        totalExpense={2000000}
        netIncome={3000000}
        month={9}
        year={2026}
        wallets={mockWallets}
      />
    )

    // Palette button should exist on the active card
    const paletteBtn = screen.getByRole('button', { name: /kustomisasi tampilan kartu/i })
    expect(paletteBtn).toBeInTheDocument()

    // Click palette button
    await userEvent.click(paletteBtn)

    // Modal title appears
    expect(screen.getByText('Kustomisasi Tampilan Kartu')).toBeInTheDocument()
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
    expect(screen.getByText('Pilihan Warna / Gradien')).toBeInTheDocument()
    expect(screen.getByText('Pola Latar (Pattern Overlay)')).toBeInTheDocument()

    // Select 'Emerald Mint' theme
    const emeraldSwatch = screen.getByRole('button', { name: /pilih warna emerald mint/i })
    await userEvent.click(emeraldSwatch)

    // Select 'Gelombang (Waves)' pattern
    const wavesPatternBtn = screen.getByRole('button', { name: /gelombang \(waves\)/i })
    await userEvent.click(wavesPatternBtn)

    // Click 'Terapkan Kustomisasi'
    const saveBtn = screen.getByRole('button', { name: /terapkan kustomisasi/i })
    await userEvent.click(saveBtn)

    // Verify localStorage has the saved customization
    const saved = localStorage.getItem('worksphere:wallet-customizations')
    expect(saved).not.toBeNull()
    const parsed = JSON.parse(saved!)
    expect(parsed.total).toEqual(
      expect.objectContaining({
        cardTheme: 'emerald-mint',
        cardPattern: 'waves',
      })
    )
  })
})




