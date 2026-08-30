import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@worksphere.id' },
    isAuthenticated: true,
  }),
  useIsAdmin: () => true,
  usePermissions: () => ({ attendance: true, finance: true, todo: true }),
}))

vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => 'online'),
}))

const mockDashboardData = {
  data: {
    finance: { totalBalance: 500000, totalIncome: 1000000, totalExpense: 500000, walletCount: 2 },
    attendance: { present: 3, absent: 1, holiday: 0, unrecorded: 1, totalMembers: 5 },
    todo: { total: 10, todo: 4, inProgress: 3, completed: 2, overdue: 1 },
  },
  loading: false,
  error: null,
  refresh: vi.fn(),
}

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: vi.fn(() => mockDashboardData),
}))

describe('DashboardPage', () => {
  it('should render greeting with user email prefix', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/test/)).toBeInTheDocument()
  })

  it('should render current date in Indonesian', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getByText(today)).toBeInTheDocument()
  })

  it('should render feature summary cards', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Absensi Hari Ini')).toBeInTheDocument()
    expect(screen.getAllByText(/Keuangan/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('To-Do')).toBeInTheDocument()
  })

  it('should show offline message when offline', async () => {
    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus')
    vi.mocked(useNetworkStatus).mockReturnValueOnce('offline' as never)

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(
      screen.getByText('Offline — perubahan akan disinkronkan saat online.')
    ).toBeInTheDocument()
  })

  it('should not show offline message when online', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(
      screen.queryByText('Offline — perubahan akan disinkronkan saat online.')
    ).not.toBeInTheDocument()
  })

  it('should render attendance summary card with today data', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Absensi Hari Ini')).toBeInTheDocument()
    expect(screen.getAllByText('Hadir').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)
  })

  it('should render finance summary card with balance', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getAllByText(/Keuangan/).length).toBeGreaterThanOrEqual(1)
  })

  it('should render todo summary card with stats', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('To-Do')).toBeInTheDocument()
  })

  it('should show overdue indicator when tasks are overdue', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Terlambat')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })

  it('should show loading skeleton when loading', async () => {
    const { useDashboard } = await import('@/hooks/useDashboard')
    vi.mocked(useDashboard).mockReturnValueOnce({
      ...mockDashboardData,
      loading: true,
    })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(
      screen.getAllByRole('generic').filter(el => el.className.includes('animate-pulse')).length
    ).toBeGreaterThan(0)
  })

  it('should show error state when error occurs', async () => {
    const { useDashboard } = await import('@/hooks/useDashboard')
    vi.mocked(useDashboard).mockReturnValueOnce({
      ...mockDashboardData,
      error: 'Gagal memuat data dashboard. Silakan coba lagi.',
    })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Gagal memuat data dashboard. Silakan coba lagi.')).toBeInTheDocument()
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('should show retry button in error state', async () => {
    const refreshFn = vi.fn()
    const { useDashboard } = await import('@/hooks/useDashboard')
    vi.mocked(useDashboard).mockReturnValueOnce({
      ...mockDashboardData,
      error: 'Gagal memuat data',
      refresh: refreshFn,
    })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    screen.getByText('Coba Lagi').click()
    expect(refreshFn).toHaveBeenCalled()
  })
})
