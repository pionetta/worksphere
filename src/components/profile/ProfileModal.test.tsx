import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileModal } from './ProfileModal'

const mockUpdateUserProfile = vi.fn()
const mockUpdateUserPassword = vi.fn()

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'test@worksphere.id',
      user_metadata: {
        full_name: 'Budi Santoso',
        username: 'budisantoso',
        avatar_url: null,
      },
    },
    updateUserProfile: mockUpdateUserProfile,
    updateUserPassword: mockUpdateUserPassword,
  }),
}))

describe('ProfileModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateUserProfile.mockResolvedValue({ error: null, data: { user: {} } })
    mockUpdateUserPassword.mockResolvedValue({ error: null })
  })

  it('should render profile information and tabs when open', () => {
    render(<ProfileModal open={true} onClose={vi.fn()} />)

    expect(screen.getByText('Profil Pengguna')).toBeInTheDocument()
    expect(screen.getByText('Informasi Profil')).toBeInTheDocument()
    expect(screen.getByText('Ganti Password')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Budi Santoso')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@worksphere.id')).toBeInTheDocument()
  })

  it('should switch between tabs', () => {
    render(<ProfileModal open={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByText('Ganti Password'))
    expect(screen.getByLabelText('Password Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Konfirmasi Password Baru')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Informasi Profil'))
    expect(screen.getByLabelText('Nama Lengkap / Username')).toBeInTheDocument()
  })

  it('should update username on form submit', async () => {
    render(<ProfileModal open={true} onClose={vi.fn()} />)

    const input = screen.getByLabelText('Nama Lengkap / Username')
    fireEvent.change(input, { target: { value: 'Budi Baru' } })

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        username: 'Budi Baru',
        avatarUrl: null,
      })
    })
  })

  it('should validate password format and match on password change', async () => {
    render(<ProfileModal open={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByText('Ganti Password'))

    // Too simple password (no number)
    const newPass = screen.getByLabelText('Password Baru')
    const confirmPass = screen.getByLabelText('Konfirmasi Password Baru')

    fireEvent.change(newPass, { target: { value: 'password' } })
    fireEvent.change(confirmPass, { target: { value: 'password' } })

    fireEvent.click(screen.getByRole('button', { name: 'Ubah Password' }))

    expect(
      screen.getByText(
        /Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka/i
      )
    ).toBeInTheDocument()
    expect(mockUpdateUserPassword).not.toHaveBeenCalled()
  })

  it('should call updateUserPassword when valid', async () => {
    render(<ProfileModal open={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByText('Ganti Password'))

    const newPass = screen.getByLabelText('Password Baru')
    const confirmPass = screen.getByLabelText('Konfirmasi Password Baru')

    fireEvent.change(newPass, { target: { value: 'Rahasia123' } })
    fireEvent.change(confirmPass, { target: { value: 'Rahasia123' } })

    fireEvent.click(screen.getByRole('button', { name: 'Ubah Password' }))

    await waitFor(() => {
      expect(mockUpdateUserPassword).toHaveBeenCalledWith('Rahasia123')
    })
  })
})
