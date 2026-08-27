import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import {
  ensureUserProfile,
  getAllUsers,
  getUserProfile,
  updateUserRole,
  updateUserPermissions,
  toggleUserStatus,
  isDefaultAdminEmail,
} from './userService'
import type { User } from '@supabase/supabase-js'

describe('userService', () => {
  beforeEach(async () => {
    await db.profiles.clear()
  })

  it('should identify default admin emails correctly', () => {
    expect(isDefaultAdminEmail('rusdiaristiawan@gmail.com')).toBe(true)
    expect(isDefaultAdminEmail('RUSDIARISTIAWAN@GMAIL.COM')).toBe(true)
    expect(isDefaultAdminEmail('admin@worksphere.local')).toBe(true)
    expect(isDefaultAdminEmail('regularuser@gmail.com')).toBe(false)
    expect(isDefaultAdminEmail('')).toBe(false)
  })

  it('should create and upgrade admin profile for admin email', async () => {
    const mockAdminUser: User = {
      id: 'admin-1',
      email: 'rusdiaristiawan@gmail.com',
      app_metadata: {},
      user_metadata: { full_name: 'Rusdi Aristiawan' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const profile = await ensureUserProfile(mockAdminUser)
    expect(profile.id).toBe('admin-1')
    expect(profile.role).toBe('admin')
    expect(profile.permissions.attendance).toBe(true)
    expect(profile.permissions.finance).toBe(true)
    expect(profile.permissions.todo).toBe(true)
    expect(profile.is_active).toBe(true)
  })

  it('should create regular user profile with default permissions', async () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'staff@company.com',
      app_metadata: {},
      user_metadata: { full_name: 'Staff User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const profile = await ensureUserProfile(mockUser)
    expect(profile.id).toBe('user-1')
    expect(profile.role).toBe('user')
    expect(profile.permissions).toEqual({
      attendance: true,
      finance: true,
      todo: true,
    })
  })

  it('should update user role and permissions', async () => {
    const mockUser: User = {
      id: 'user-2',
      email: 'staff2@company.com',
      app_metadata: {},
      user_metadata: { full_name: 'Staff 2' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    await ensureUserProfile(mockUser)

    // Update permissions (e.g. disable finance)
    const updatedPerms = await updateUserPermissions('user-2', { finance: false })
    expect(updatedPerms.permissions.finance).toBe(false)
    expect(updatedPerms.permissions.attendance).toBe(true)

    // Update role to admin
    const updatedRole = await updateUserRole('user-2', 'admin')
    expect(updatedRole.role).toBe('admin')
    expect(updatedRole.permissions.finance).toBe(true) // Admin gets all permissions restored

    // Toggle active status
    const suspended = await toggleUserStatus('user-2', false)
    expect(suspended.is_active).toBe(false)

    const all = await getAllUsers()
    expect(all.length).toBe(1)
    expect(all[0].id).toBe('user-2')

    const fetched = await getUserProfile('user-2')
    expect(fetched?.is_active).toBe(false)
  })
})
