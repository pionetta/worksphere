import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QuickActions } from './QuickActions'

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

const mockRefresh = vi.fn()

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render FAB', () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('Buka menu aksi cepat')).toBeInTheDocument()
  })

  it('should open menu when FAB clicked', () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    expect(screen.getByText('Absensi')).toBeInTheDocument()
    expect(screen.getByText('Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('should close menu and open attendance sheet when Absensi selected', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Absensi'))
    await waitFor(() => {
      expect(screen.getByText('Catat Absensi Hari Ini')).toBeInTheDocument()
    })
  })

  it('should close menu and open income sheet when Pemasukan selected', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Pemasukan'))
    await waitFor(() => {
      expect(screen.getAllByText('Tambah Pemasukan').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should close menu and open expense sheet when Pengeluaran selected', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Pengeluaran'))
    await waitFor(() => {
      expect(screen.getAllByText('Tambah Pengeluaran').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should close menu and open transfer sheet when Transfer selected', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Transfer'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should close menu and open task sheet when Task selected', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Task'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Masukkan judul tugas...')).toBeInTheDocument()
  })

  it('should close sheet via Tutup button', async () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    fireEvent.click(screen.getByLabelText('Tambah Task'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByLabelText('Tutup'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should have accessible labels for all menu actions', () => {
    render(
      <MemoryRouter>
        <QuickActions userId="user-1" onActionComplete={mockRefresh} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Buka menu aksi cepat'))
    expect(screen.getByLabelText('Tambah Absensi')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Pemasukan')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Transfer')).toBeInTheDocument()
    expect(screen.getByLabelText('Tambah Task')).toBeInTheDocument()
  })
})
