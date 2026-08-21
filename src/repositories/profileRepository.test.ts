import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpsert = vi.fn()
const mockUpdate = vi.fn()

const mockQuery = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  upsert: mockUpsert,
  update: mockUpdate,
}

const mockFrom = vi.fn(() => mockQuery)

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

describe('Profile Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue(mockQuery)
    mockEq.mockReturnValue(mockQuery)
    mockUpsert.mockReturnValue(mockQuery)
    mockUpdate.mockReturnValue(mockQuery)
  })

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'Test User',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      const { getProfile } = await import('@/repositories/profileRepository')
      const result = await getProfile('user-123')

      expect(result).toEqual(mockProfile)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSingle).toHaveBeenCalled()
    })

    it('should return null when profile not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      const { getProfile } = await import('@/repositories/profileRepository')
      const result = await getProfile('nonexistent-user')

      expect(result).toBeNull()
    })

    it('should throw error on other errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation not found' },
      })

      const { getProfile } = await import('@/repositories/profileRepository')

      await expect(getProfile('user-123')).rejects.toThrow()
    })
  })

  describe('upsertProfile', () => {
    it('should upsert profile successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'Test User',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      const { upsertProfile } = await import('@/repositories/profileRepository')
      const result = await upsertProfile({
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'Test User',
      })

      expect(result).toEqual(mockProfile)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpsert).toHaveBeenCalled()
    })

    it('should throw error on upsert failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Upsert failed' },
      })

      const { upsertProfile } = await import('@/repositories/profileRepository')

      await expect(
        upsertProfile({
          id: 'user-123',
          email: 'test@example.com',
          display_name: 'Test User',
        })
      ).rejects.toThrow()
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockEq.mockResolvedValue({ error: null })

      const { updateProfile } = await import('@/repositories/profileRepository')

      await expect(updateProfile('user-123', { display_name: 'New Name' })).resolves.not.toThrow()

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('should throw error on update failure', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Update failed' } })

      const { updateProfile } = await import('@/repositories/profileRepository')

      await expect(updateProfile('user-123', { display_name: 'New Name' })).rejects.toThrow()
    })
  })
})
