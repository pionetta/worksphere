import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionFAB } from './QuickActionFAB'

describe('QuickActionFAB', () => {
  it('should render', () => {
    render(<QuickActionFAB onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<QuickActionFAB onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should have aria-label to open menu', () => {
    render(<QuickActionFAB onClick={vi.fn()} />)
    expect(screen.getByLabelText('Buka menu aksi cepat')).toBeInTheDocument()
  })

  it('should have aria-label to close menu when open', () => {
    render(<QuickActionFAB onClick={vi.fn()} open={true} />)
    expect(screen.getByLabelText('Tutup menu aksi cepat')).toBeInTheDocument()
  })

  it('should have aria-expanded false when closed', () => {
    render(<QuickActionFAB onClick={vi.fn()} open={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('should have aria-expanded true when open', () => {
    render(<QuickActionFAB onClick={vi.fn()} open={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })
})
