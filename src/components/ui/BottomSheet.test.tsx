import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('should not render when closed', () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()} title="Test Title">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose} title="Title">
        <div>Content</div>
      </BottomSheet>
    )
    fireEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        <div>Content</div>
      </BottomSheet>
    )
    const overlay = container.querySelector('[role="dialog"]')
    if (overlay) {
      fireEvent.click(overlay)
    }
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape pressed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose}>
        <div>Content</div>
      </BottomSheet>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have dialog role', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should have aria-modal', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('should have aria-label from title', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()} title="My Dialog">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My Dialog')
  })
})
