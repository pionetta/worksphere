import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetCard } from './BudgetCard'
import { SavingsGoalCard } from './SavingsGoalCard'
import type { Budget, SavingsGoal } from '@/types'

describe('BudgetCard Soft Neumorphism', () => {
  const mockBudget: Budget = {
    id: 'b-1',
    user_id: 'user-1',
    category_id: 'cat-1',
    amount: 1000000,
    month: 9,
    year: 2026,
    note: null,
    created_at: '2026-09-01',
    updated_at: '2026-09-01',
  }

  it('renders soft neumorphic container, squircle category icon, and plafon subtext', () => {
    const { container } = render(
      <BudgetCard
        budget={mockBudget}
        categoryName="Transportasi"
        spent={250000}
      />
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('rounded-3xl')
    expect(card).toHaveClass('bg-[#F0F3F8]')

    // Squircle icon initial
    expect(screen.getByText('T')).toBeInTheDocument()
    // Category name
    expect(screen.getByText('Transportasi')).toBeInTheDocument()
    // Plafon subtext
    expect(screen.getByText(/Plafon: Rp\s?1\.000\.000/i)).toBeInTheDocument()
  })

  it('renders percentage badge and concave neumorphic progress bar', () => {
    const { container } = render(
      <BudgetCard
        budget={mockBudget}
        categoryName="Transportasi"
        spent={250000}
      />
    )

    // Percentage badge (25% Normal)
    expect(screen.getByText(/25%/)).toBeInTheDocument()
    expect(screen.getByText(/Normal/)).toBeInTheDocument()

    // Concave track
    const track = container.querySelector('.shadow-\\[inset_1px_1px_3px_rgba\\(0\\,0\\,0\\,0\\.15\\)\\]')
    expect(track).toBeInTheDocument()
    expect(track).toHaveClass('h-3')
    expect(track).toHaveClass('rounded-full')

    // Bottom row 2 columns: Terpakai and Sisa
    expect(screen.getByText(/Terpakai:\s*Rp\s?250\.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Sisa:\s*Rp\s?750\.000/i)).toBeInTheDocument()
  })

  it('toggles MoreVertical menu and handles onEdit and onDelete', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <BudgetCard
        budget={mockBudget}
        categoryName="Transportasi"
        spent={250000}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const menuButton = screen.getByTitle('Menu aksi anggaran')
    await userEvent.click(menuButton)

    const editBtn = screen.getByRole('button', { name: /edit/i })
    const deleteBtn = screen.getByRole('button', { name: /hapus/i })
    expect(editBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()

    await userEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledTimes(1)

    // Open menu again for delete
    await userEvent.click(menuButton)
    const deleteBtnAfter = screen.getByRole('button', { name: /hapus/i })
    await userEvent.click(deleteBtnAfter)
    expect(onDelete).toHaveBeenCalledWith('b-1')
  })
})

describe('SavingsGoalCard Soft Neumorphism & Accordion Breakdown', () => {
  const mockGoal: SavingsGoal = {
    id: 's-1',
    user_id: 'user-1',
    name: 'Beli Laptop',
    target_amount: 10000000,
    current_amount: 2500000,
    deadline: '2026-12-31',
    note: null,
    created_at: '2026-09-01',
    updated_at: '2026-09-01',
  }

  it('renders soft neumorphic container with prominent collected amount and deadline pill', () => {
    const { container } = render(<SavingsGoalCard goal={mockGoal} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('rounded-3xl')
    expect(card).toHaveClass('bg-[#F0F3F8]')

    // Title
    expect(screen.getByText('Beli Laptop')).toBeInTheDocument()

    // Deadline pill
    expect(screen.getByText(/hari lagi/i)).toBeInTheDocument()

    // Bold collected amount as primary focus
    expect(screen.getByText(/Rp2\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/dari target\s+Rp10\.000\.000/i)).toBeInTheDocument()
  })

  it('renders quick action buttons Setor and Tarik', async () => {
    const onAdd = vi.fn()
    const onWithdraw = vi.fn()

    render(
      <SavingsGoalCard
        goal={mockGoal}
        onAdd={onAdd}
        onWithdraw={onWithdraw}
      />
    )

    const setorBtn = screen.getByRole('button', { name: /setor/i })
    const tarikBtn = screen.getByRole('button', { name: /tarik/i })
    expect(setorBtn).toBeInTheDocument()
    expect(tarikBtn).toBeInTheDocument()

    await userEvent.click(setorBtn)
    expect(onAdd).toHaveBeenCalledWith('s-1')

    await userEvent.click(tarikBtn)
    expect(onWithdraw).toHaveBeenCalledWith('s-1')
  })

  it('toggles MoreVertical menu for Edit/Delete', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <SavingsGoalCard
        goal={mockGoal}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const menuButton = screen.getByTitle('Menu aksi tabungan')
    await userEvent.click(menuButton)

    const editBtn = screen.getByRole('button', { name: /edit/i })
    const deleteBtn = screen.getByRole('button', { name: /hapus/i })
    expect(editBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()

    await userEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('collapses breakdown simulation by default and expands on click', async () => {
    render(<SavingsGoalCard goal={mockGoal} />)

    // Initially simulation details are collapsed
    expect(screen.queryByText('Target tersisa:')).not.toBeInTheDocument()
    const toggleBtn = screen.getByRole('button', { name: /lihat rekomendasi nabung/i })
    expect(toggleBtn).toBeInTheDocument()

    // Click accordion toggle
    await userEvent.click(toggleBtn)

    // Expanded: shows breakdown details
    expect(screen.getByText('Target tersisa:')).toBeInTheDocument()
    expect(screen.getByText('Harian')).toBeInTheDocument()
    expect(screen.getByText('Mingguan')).toBeInTheDocument()
    expect(screen.getByText('Bulanan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tutup rekomendasi nabung/i })).toBeInTheDocument()

    // Click to collapse again
    await userEvent.click(screen.getByRole('button', { name: /tutup rekomendasi nabung/i }))
    expect(screen.queryByText('Target tersisa:')).not.toBeInTheDocument()
  })
})
