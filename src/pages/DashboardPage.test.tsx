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

  it('normalizes container bottom padding to pb-28 to avoid excessive space and eliminate inner grid pb-36', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    // Outer container should have pb-28
    const outerContainer = container.querySelector('.max-w-5xl')
    expect(outerContainer).toHaveClass('pb-28')

    // Inner grid should NOT have pb-36 or excessive padding
    const innerGrid = container.querySelector('.grid.grid-cols-2')
    expect(innerGrid?.className).not.toContain('pb-36')
    expect(innerGrid?.className).not.toContain('pb-60')
    expect(innerGrid?.className).not.toContain('pb-80')
  })

  it('renders Attendance card header with space-between layout without text collision', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    // "Presensi & Kehadiran" header and "Buka Rekap →" link
    const attendanceTitle = screen.getByText('Presensi & Kehadiran')
    expect(attendanceTitle).toBeInTheDocument()
    expect(attendanceTitle).toHaveClass('truncate')

    const rekapLink = screen.getByRole('link', { name: /buka rekap/i })
    expect(rekapLink).toBeInTheDocument()
    expect(rekapLink).toHaveClass('shrink-0')
    expect(rekapLink).toHaveClass('text-emerald-600')

    // Header wrapper should use flex items-center justify-between
    const headerWrapper = attendanceTitle.closest('.w-full.flex.items-center.justify-between')
    expect(headerWrapper).toBeInTheDocument()
    expect(headerWrapper).toHaveClass('mb-3')
  })
})
