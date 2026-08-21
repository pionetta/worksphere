import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Simpan</Button>)
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument()
  })

  it('should apply primary variant by default', () => {
    render(<Button>Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary-500')
  })

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-gray-100')
  })

  it('should apply ghost variant', () => {
    render(<Button variant="ghost">Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
  })

  it('should apply danger variant', () => {
    render(<Button variant="danger">Hapus</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-danger')
  })

  it('should be disabled when loading', () => {
    render(<Button loading>Menyimpan...</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should render icon when provided', () => {
    render(<Button icon={<span data-testid="icon" />}>Test</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should apply size styles', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('px-3')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('px-6')
  })
})

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Input error="Wajib diisi" />)
    expect(screen.getByText('Wajib diisi')).toBeInTheDocument()
  })

  it('should apply error border', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-danger')
  })
})

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should apply glass style when glass prop is true', () => {
    const { container } = render(<Card glass>Glass Card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('glass')
  })

  it('should apply default white background when not glass', () => {
    const { container } = render(<Card>Normal Card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-white')
  })
})

describe('Badge', () => {
  it('should render text', () => {
    render(<Badge>Urgent</Badge>)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('should apply variant styles', () => {
    const { rerender } = render(<Badge variant="success">Hadir</Badge>)
    expect(screen.getByText('Hadir').className).toContain('bg-success-light')

    rerender(<Badge variant="danger">Absen</Badge>)
    expect(screen.getByText('Absen').className).toContain('bg-danger-light')
  })
})

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="Tidak ada data" />)
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<EmptyState title="Kosong" description="Belum ada data" />)
    expect(screen.getByText('Belum ada data')).toBeInTheDocument()
  })
})

describe('LoadingState', () => {
  it('should render default loading text', () => {
    render(<LoadingState />)
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })

  it('should render custom text', () => {
    render(<LoadingState text="Menyinkronkan..." />)
    expect(screen.getByText('Menyinkronkan...')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('should render default error message', () => {
    render(<ErrorState />)
    expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument()
  })

  it('should render retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    const retryButton = screen.getByRole('button', { name: 'Coba Lagi' })
    expect(retryButton).toBeInTheDocument()
  })
})
