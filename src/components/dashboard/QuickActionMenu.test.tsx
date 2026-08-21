import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionMenu } from './QuickActionMenu'

describe('QuickActionMenu', () => {
  it('should not render when closed', () => {
    render(<QuickActionMenu open={false} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByText('Absensi')).not.toBeInTheDocument()
  })

  it('should render all 5 actions when open', () => {
    render(<QuickActionMenu open={true} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Absensi')).toBeInTheDocument()
    expect(screen.getByText('Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('should call onSelect with attendance when Absensi clicked', () => {
    const onSelect = vi.fn()
    render(<QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Tambah Absensi'))
    expect(onSelect).toHaveBeenCalledWith('attendance')
  })

  it('should call onSelect with income when Pemasukan clicked', () => {
    const onSelect = vi.fn()
    render(<QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Tambah Pemasukan'))
    expect(onSelect).toHaveBeenCalledWith('income')
  })

  it('should call onSelect with expense when Pengeluaran clicked', () => {
    const onSelect = vi.fn()
    render(<QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Tambah Pengeluaran'))
    expect(onSelect).toHaveBeenCalledWith('expense')
  })

  it('should call onSelect with transfer when Transfer clicked', () => {
    const onSelect = vi.fn()
    render(<QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Tambah Transfer'))
    expect(onSelect).toHaveBeenCalledWith('transfer')
  })

  it('should call onSelect with task when Task clicked', () => {
    const onSelect = vi.fn()
    render(<QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Tambah Task'))
    expect(onSelect).toHaveBeenCalledWith('task')
  })

  it('should have accessible labels for all actions', () => {
    render(<QuickActionMenu open={true} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByLabelText('Tambah Absensi')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Pemasukan')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Transfer')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Task')).toBeInTheDocument()
  })

  it('should call onClose when Escape pressed', () => {
    const onClose = vi.fn()
    render(<QuickActionMenu open={true} onSelect={vi.fn()} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <QuickActionMenu open={true} onSelect={vi.fn()} onClose={onClose} />
    )
    const backdrop = container.querySelector('.fixed.inset-0.z-30')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have menu role', () => {
    render(<QuickActionMenu open={true} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('should have menuitem roles for all actions', () => {
    render(<QuickActionMenu open={true} onSelect={vi.fn()} onClose={vi.fn()} />)
    const items = screen.getAllByRole('menuitem')
    expect(items).toHaveLength(5)
  })

  it('should not call onSelect when backdrop clicked', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <QuickActionMenu open={true} onSelect={onSelect} onClose={vi.fn()} />
    )
    const backdrop = container.querySelector('.fixed.inset-0.z-30')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    expect(onSelect).not.toHaveBeenCalled()
  })
})
