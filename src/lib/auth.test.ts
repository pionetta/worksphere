import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  describe('signIn', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const { signIn } = await import('@/lib/auth')
      mockSignInWithPassword.mockResolvedValue({ error: null })

      await signIn('test@example.com', 'password123')

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should return error on invalid credentials', async () => {
      const { signIn } = await import('@/lib/auth')
      const mockError = { message: 'Invalid login credentials' }
      mockSignInWithPassword.mockResolvedValue({ error: mockError })

      const result = await signIn('wrong@example.com', 'wrongpassword')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('should call signUp with correct data', async () => {
      const { signUp } = await import('@/lib/auth')
      mockSignUp.mockResolvedValue({ error: null })

      await signUp('new@example.com', 'password123')

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })
  })

  describe('signOut', () => {
    it('should call signOut', async () => {
      const { signOut } = await import('@/lib/auth')
      mockSignOut.mockResolvedValue({ error: null })

      await signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})
