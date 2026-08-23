import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUseAuth = vi.fn()
const mockSignInDemo = vi.fn()
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockSetTheme = vi.fn()
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    resolved: 'light',
    setTheme: mockSetTheme,
  }),
}))

const mockInstallPwa = vi.fn()
const mockUsePwaInstall = vi.fn()
vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaInstall: () => mockUsePwaInstall(),
}))

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signInDemo: mockSignInDemo,
    })
    mockUsePwaInstall.mockReturnValue({
      canInstall: false,
      installPwa: mockInstallPwa,
    })
  })

  it('renders branding and headline correctly', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/WorkSphere/i).length).toBeGreaterThan(0)
    expect(
      screen.getByText(/Aplikasi All-in-One: Absensi, Keuangan & Tugas/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Satu Tempat untuk Semua/i)).toBeInTheDocument()
  })

  it('shows feature pillars (Absensi, Keuangan, To-Do)', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Absensi & Tim')).toBeInTheDocument()
    expect(screen.getByText('Keuangan & Multi-Dompet')).toBeInTheDocument()
    expect(screen.getByText('Manajemen Tugas (To-Do)')).toBeInTheDocument()
  })

  it('triggers demo mode when demo button is clicked', async () => {
    mockSignInDemo.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const demoButtons = screen.getAllByRole('button', { name: /mode demo/i })
    expect(demoButtons.length).toBeGreaterThan(0)
    fireEvent.click(demoButtons[0])

    await waitFor(() => {
      expect(mockSignInDemo).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/app')
    })
  })

  it('toggles theme when theme button is clicked', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const themeBtn = screen.getByRole('button', { name: /toggle tema/i })
    fireEvent.click(themeBtn)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('displays PWA install buttons when canInstall is true', () => {
    mockUsePwaInstall.mockReturnValue({
      canInstall: true,
      installPwa: mockInstallPwa,
    })

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const installBtns = screen.getAllByText(/instal app|pasang aplikasi/i)
    expect(installBtns.length).toBeGreaterThan(0)
    fireEvent.click(installBtns[0])
    expect(mockInstallPwa).toHaveBeenCalled()
  })

  it('shows dashboard CTA when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      signInDemo: mockSignInDemo,
    })

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const dashLinks = screen.getAllByText(/buka dashboard|masuk ke dashboard/i)
    expect(dashLinks.length).toBeGreaterThan(0)
  })
})
