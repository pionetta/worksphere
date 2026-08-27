import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole, UserPermissions } from '@/types'
import type { User } from '@supabase/supabase-js'

export const ADMIN_EMAILS = [
  'rusdiaristiawan@gmail.com',
  'admin@worksphere.local',
]

export const DEFAULT_PERMISSIONS: UserPermissions = {
  attendance: true,
  finance: true,
  todo: true,
}

export function isDefaultAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.trim().toLowerCase())
}

/**
 * Ensures user profile exists in Dexie (and Supabase if online).
 * Automatically assigns 'admin' role if the email is in the admin whitelist.
 */
export async function ensureUserProfile(user: User): Promise<Profile> {
  const existing = await db.profiles.get(user.id)
  const isAdmin = isDefaultAdminEmail(user.email)
  const defaultRole: UserRole = isAdmin ? 'admin' : (user.user_metadata?.role as UserRole) || 'user'
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'

  if (existing) {
    // If user's email qualifies as default admin, upgrade if needed
    if (isAdmin && existing.role !== 'admin') {
      const updated: Profile = {
        ...existing,
        role: 'admin',
        permissions: { attendance: true, finance: true, todo: true },
        updated_at: new Date().toISOString(),
      }
      await db.profiles.put(updated)
      return updated
    }
    return existing
  }

  const newProfile: Profile = {
    id: user.id,
    email: user.email || '',
    display_name: displayName,
    role: defaultRole,
    permissions: isAdmin
      ? { attendance: true, finance: true, todo: true }
      : { ...DEFAULT_PERMISSIONS },
    is_active: true,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await db.profiles.put(newProfile)

  // Sync to Supabase profiles table if available
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await (supabase.from('profiles') as any).upsert({
        id: newProfile.id,
        email: newProfile.email,
        display_name: newProfile.display_name,
        role: newProfile.role,
        permissions: newProfile.permissions,
        is_active: newProfile.is_active,
        created_at: newProfile.created_at,
        updated_at: newProfile.updated_at,
      })
    }
  } catch {
    // Silently continue offline
  }

  return newProfile
}

/**
 * Get all registered user profiles (For Admin view)
 */
export async function getAllUsers(): Promise<Profile[]> {
  try {
    // First try fetching from Supabase if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const { data, error } = await (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase profiles fetch warning:', error.message)
      } else if (data && data.length > 0) {
        // Cache to Dexie
        for (const item of data) {
          const isAdmin = isDefaultAdminEmail(item.email)
          await db.profiles.put({
            id: item.id,
            email: item.email || '',
            display_name: item.display_name || item.email?.split('@')[0] || 'User',
            role: isAdmin ? 'admin' : (item.role as UserRole) || 'user',
            permissions: isAdmin
              ? { attendance: true, finance: true, todo: true }
              : item.permissions || { ...DEFAULT_PERMISSIONS },
            is_active: item.is_active !== false,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          })
        }
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch profiles from cloud:', err?.message)
  }

  return await db.profiles.toArray()
}

/**
 * Get profile for a specific user
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const profile = await db.profiles.get(userId)
  return profile || null
}

/**
 * Update user role (admin / user)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<Profile> {
  const existing = await db.profiles.get(userId)
  if (!existing) {
    throw new Error('User profile not found')
  }

  const updated: Profile = {
    ...existing,
    role,
    // Admins automatically get all permissions
    permissions: role === 'admin' ? { attendance: true, finance: true, todo: true } : existing.permissions,
    updated_at: new Date().toISOString(),
  }

  await db.profiles.put(updated)

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await (supabase.from('profiles') as any).update({
        role: updated.role,
        permissions: updated.permissions,
        updated_at: updated.updated_at,
      }).eq('id', userId)
    }
  } catch {
    // Offline sync
  }

  return updated
}

/**
 * Update modular feature permissions for a user
 */
export async function updateUserPermissions(
  userId: string,
  permissions: Partial<UserPermissions>
): Promise<Profile> {
  const existing = await db.profiles.get(userId)
  if (!existing) {
    throw new Error('User profile not found')
  }

  const newPermissions: UserPermissions = {
    ...existing.permissions,
    ...permissions,
  }

  const updated: Profile = {
    ...existing,
    permissions: newPermissions,
    updated_at: new Date().toISOString(),
  }

  await db.profiles.put(updated)

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await (supabase.from('profiles') as any).update({
        permissions: updated.permissions,
        updated_at: updated.updated_at,
      }).eq('id', userId)
    }
  } catch {
    // Offline sync
  }

  return updated
}

/**
 * Activate or suspend a user account
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<Profile> {
  const existing = await db.profiles.get(userId)
  if (!existing) {
    throw new Error('User profile not found')
  }

  const updated: Profile = {
    ...existing,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  }

  await db.profiles.put(updated)

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await (supabase.from('profiles') as any).update({
        is_active: updated.is_active,
        updated_at: updated.updated_at,
      }).eq('id', userId)
    }
  } catch {
    // Offline sync
  }

  return updated
}
