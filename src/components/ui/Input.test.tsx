import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('should render with label', () => {
    render(<Input label="Nama" />)
    expect(screen.getByLabelText('Nama')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(<Input placeholder="Ketik..." />)
    expect(screen.getByPlaceholderText('Ketik...')).toBeInTheDocument()
  })

  it('should show required asterisk visually when required', () => {
    const { container } = render(<Input label="Nama" required />)
    const asterisk = container.querySelector('span[aria-hidden="true"]')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveTextContent('*')
  })

  it('should have aria-required when required', () => {
    render(<Input label="Nama" required />)
    expect(screen.getByRole('textbox', { name: /nama/i })).toHaveAttribute('aria-required', 'true')
  })

  it('should not have aria-required when not required', () => {
    render(<Input label="Nama" />)
    expect(screen.getByLabelText('Nama')).not.toHaveAttribute('aria-required')
  })

  it('should have aria-invalid when error provided', () => {
    render(<Input label="Nama" error="Wajib diisi" />)
    expect(screen.getByRole('textbox', { name: /nama/i })).toHaveAttribute('aria-invalid', 'true')
  })

  it('should not have aria-invalid when no error', () => {
    render(<Input label="Nama" />)
    expect(screen.getByLabelText('Nama')).not.toHaveAttribute('aria-invalid')
  })

  it('should have aria-describedby linking to error', () => {
    render(<Input label="Nama" error="Wajib diisi" />)
    const input = screen.getByRole('textbox', { name: /nama/i })
    const errorId = input.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(document.getElementById(errorId!)).toHaveTextContent('Wajib diisi')
  })

  it('should show error with role="alert"', () => {
    render(<Input label="Nama" error="Wajib diisi" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Wajib diisi')
  })

  it('should not render error when no error', () => {
    render(<Input label="Nama" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should use custom id when provided', () => {
    render(<Input label="Nama" id="custom-id" />)
    expect(screen.getByLabelText('Nama')).toHaveAttribute('id', 'custom-id')
  })

  it('should generate stable id across renders', () => {
    const { unmount } = render(<Input label="Nama" />)
    const id1 = screen.getByLabelText('Nama').id
    unmount()
    render(<Input label="Nama" />)
    const id2 = screen.getByLabelText('Nama').id
    expect(id1).not.toBe(id2)
  })
})
