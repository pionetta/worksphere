import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '@/App'

const mockUseAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
  useIsAdmin: () => true,
  usePermissions: () => ({ attendance: true, finance: true, todo: true }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light' as const,
    resolved: 'light' as const,
    setTheme: vi.fn(),
  }),
}))

vi.mock('@/hooks/useSyncStatus', () => ({
  useSyncStatus: () => ({
    status: 'synced',
    pendingCount: 0,
    lastSyncResult: null,
    lastSyncTime: new Date('2026-08-18T10:00:00Z'),
    sync: vi.fn(),
    retry: vi.fn(),
  }),
}))

vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => 'online',
}))

vi.mock('@/pages/LandingPage', () => ({
  LandingPage: () => <div>Halaman Utama Worksphere</div>,
}))

vi.mock('@/pages/DashboardPage', () => ({
  DashboardPage: () => <div>Selamat pagi</div>,
}))

vi.mock('@/pages/AttendancePage', () => ({
  AttendancePage: () => (
    <div>
      <div>Absensi</div>
      <div>Anggota</div>
      <div>Rekap</div>
    </div>
  ),
}))

vi.mock('@/pages/FinancePage', () => ({
  FinancePage: () => (
    <div>
      <div>Ringkasan</div>
      <div>Dompet</div>
      <div>Transaksi</div>
    </div>
  ),
}))

vi.mock('@/pages/TodoPage', () => ({
  TodoPage: () => (
    <div>
      <div>Tugas</div>
      <div>Tambah</div>
    </div>
  ),
}))

describe('App Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render LandingPage on root / when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Halaman Utama Worksphere')).toBeInTheDocument()
    })
  })

  it('should render LandingPage on root / even when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Halaman Utama Worksphere')).toBeInTheDocument()
    })
  })

  it('should redirect unknown routes to LandingPage on /', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/some-random-unknown-path']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Halaman Utama Worksphere')).toBeInTheDocument()
    })
  })

  it('should redirect to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /^masuk$/i })).toBeInTheDocument()
  })

  it('should show dashboard when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getAllByText(/Selamat/).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should redirect authenticated user away from /login', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getAllByText(/Selamat/).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should show login page when visiting /login unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /^masuk$/i })).toBeInTheDocument()
  })

  it('should show loading screen while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })
})

describe('Feature placeholder pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      isAuthenticated: true,
    })
  })

  it('should render AttendancePage', async () => {
    render(
      <MemoryRouter initialEntries={['/app/attendance']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Anggota')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Absensi').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Rekap')).toBeInTheDocument()
  })

  it('should render FinancePage', async () => {
    render(
      <MemoryRouter initialEntries={['/app/finance']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument()
    })
    expect(screen.getByText('Dompet')).toBeInTheDocument()
    expect(screen.getByText('Transaksi')).toBeInTheDocument()
  })

  it('should render TodoPage', async () => {
    render(
      <MemoryRouter initialEntries={['/app/todo']}>
        <AppRoutes />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Tugas')).toBeInTheDocument()
    })
    expect(screen.getByText('Tambah')).toBeInTheDocument()
  })
})

describe('Theme persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('should read theme from localStorage', () => {
    localStorage.setItem('worksphere-theme', 'dark')
    const stored = localStorage.getItem('worksphere-theme')
    expect(stored).toBe('dark')
  })

  it('should persist theme selection', () => {
    localStorage.setItem('worksphere-theme', 'light')
    expect(localStorage.getItem('worksphere-theme')).toBe('light')

    localStorage.setItem('worksphere-theme', 'dark')
    expect(localStorage.getItem('worksphere-theme')).toBe('dark')
  })

  it('should default to system when no stored value', () => {
    const stored = localStorage.getItem('worksphere-theme')
    expect(stored).toBeNull()
  })
})
