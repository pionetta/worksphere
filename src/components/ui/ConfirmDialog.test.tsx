import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('should not render when closed', () => {
    render(
      <ConfirmDialog open={false} onClose={vi.fn()} onConfirm={vi.fn()} message="Test message" />
    )
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Test message" />
    )
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render default title', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Test message" />
    )
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hapus Item"
        message="Yakin?"
      />
    )
    expect(screen.getByText('Hapus Item')).toBeInTheDocument()
  })

  it('should render default confirm label', () => {
    render(<ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Test" />)
    expect(screen.getByText('Hapus')).toBeInTheDocument()
  })

  it('should render custom confirm label', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        message="Test"
        confirmLabel="Nonaktifkan"
      />
    )
    expect(screen.getByText('Nonaktifkan')).toBeInTheDocument()
  })

  it('should call onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} message="Test" />)
    fireEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm and onClose when confirm clicked', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog open={true} onClose={onClose} onConfirm={onConfirm} message="Test" />)
    fireEvent.click(screen.getByText('Hapus'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape pressed', () => {
    const onClose = vi.fn()
    render(<ConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} message="Test" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have alertdialog role', () => {
    render(<ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Test" />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('should have aria-modal', () => {
    render(<ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Test" />)
    expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('should link title via aria-labelledby', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hapus"
        message="Yakin?"
      />
    )
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
  })

  it('should link message via aria-describedby', () => {
    render(<ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} message="Yakin?" />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message')
  })

  it('should render danger variant confirm button', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        message="Test"
        variant="danger"
      />
    )
    const confirmBtn = screen.getByText('Hapus')
    expect(confirmBtn.className).toContain('danger')
  })

  it('should render warning variant confirm button with secondary style', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        message="Test"
        variant="warning"
      />
    )
    const confirmBtn = screen.getByText('Hapus')
    expect(confirmBtn.className).toContain('bg-gray-100')
  })
})
