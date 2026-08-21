import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

describe('LoadingState', () => {
  it('should have role="status"', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should have aria-live="polite"', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('should render default text', () => {
    render(<LoadingState />)
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })

  it('should render custom text', () => {
    render(<LoadingState text="Memuat data..." />)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('should have role="alert"', () => {
    render(<ErrorState />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should have aria-live="assertive"', () => {
    render(<ErrorState />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('should render default message', () => {
    render(<ErrorState />)
    expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    render(<ErrorState message="Gagal memuat data" />)
    expect(screen.getByText('Gagal memuat data')).toBeInTheDocument()
  })

  it('should render retry button when onRetry provided', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('should not render retry button when onRetry not provided', () => {
    render(<ErrorState />)
    expect(screen.queryByText('Coba Lagi')).not.toBeInTheDocument()
  })
})
