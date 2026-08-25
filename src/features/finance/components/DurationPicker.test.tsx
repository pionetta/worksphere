import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DurationPicker } from './DurationPicker'

describe('DurationPicker', () => {
  it('should render preset buttons by default', () => {
    const onChangeDeadline = vi.fn()
    render(<DurationPicker deadline="" onChangeDeadline={onChangeDeadline} />)

    expect(screen.getByText('1 Bln')).toBeInTheDocument()
    expect(screen.getByText('3 Bln')).toBeInTheDocument()
    expect(screen.getByText('6 Bln')).toBeInTheDocument()
    expect(screen.getByText('12 Bln')).toBeInTheDocument()
  })

  it('should switch to custom mode and allow selecting days, weeks, months', async () => {
    const onChangeDeadline = vi.fn()
    render(<DurationPicker deadline="" onChangeDeadline={onChangeDeadline} />)

    const customTab = screen.getByRole('button', { name: 'Kustom' })
    await userEvent.click(customTab)

    expect(screen.getByPlaceholderText('Misal: 45')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hari' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Minggu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bulan' })).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Misal: 45')
    await userEvent.type(input, '10')

    expect(onChangeDeadline).toHaveBeenCalled()

    const daysBtn = screen.getByRole('button', { name: 'Hari' })
    await userEvent.click(daysBtn)

    expect(onChangeDeadline).toHaveBeenCalled()
  })
})
