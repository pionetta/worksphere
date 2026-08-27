import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import {
  ensureUserProfile,
  getUserProfile,
  DEFAULT_PERMISSIONS,
  isDefaultAdminEmail,
} from '@/services/userService'
import type { UserRole, UserPermissions } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  role: UserRole
  permissions: UserPermissions
  isActive: boolean
}

export const DEMO_STORAGE_KEY = 'worksphere_local_user'

export const DEMO_USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Pengguna Demo', role: 'admin' },
  aud: 'authenticated',
  created_at: '2026-08-22T00:00:00.000Z',
  email: 'demo@worksphere.local',
  role: 'authenticated',
  updated_at: '2026-08-22T00:00:00.000Z',
}

export interface SignUpOptions {
  username?: string
  redirectTo?: string
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions
  ) => Promise<{ data: any | null; error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateUserProfile: (data: {
    username?: string
    avatarUrl?: string | null
  }) => Promise<{ data: { user: User | null } | null; error: AuthError | null }>
  updateUserPassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
  signInDemo: () => Promise<void>
  signOut: () => Promise<void>
}

// ─── Auth Functions (standalone, testable) ─────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  } catch (err: any) {
    return { error: err as AuthError }
  }
}

export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  try {
    const redirectUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/app`
        : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    return { error }
  } catch (err: any) {
    return { error: err as AuthError }
  }
}

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const redirectUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/login?reset=true`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    return { error }
  } catch (err: any) {
    return { error: err as AuthError }
  }
}

export async function signUp(
  email: string,
  password: string,
  options?: SignUpOptions
): Promise<{ data: any | null; error: AuthError | null }> {
  try {
    const redirectUrl =
      options?.redirectTo ??
      (typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/app`
        : undefined)

    const isAdmin = isDefaultAdminEmail(email)
    const role: UserRole = isAdmin ? 'admin' : 'user'

    const signUpParams: {
      email: string
      password: string
      options?: {
        data?: { username?: string; full_name?: string; role?: UserRole }
        emailRedirectTo?: string
      }
    } = {
      email,
      password,
    }

    signUpParams.options = {
      data: {
        ...(options?.username
          ? { username: options.username.trim(), full_name: options.username.trim() }
          : {}),
        role,
      },
      ...(redirectUrl ? { emailRedirectTo: redirectUrl } : {}),
    }

    const { data, error } = await supabase.auth.signUp(signUpParams)
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err as AuthError }
  }
}

export async function updateUserProfile(data: {
  username?: string
  avatarUrl?: string | null
}): Promise<{ data: { user: User | null } | null; error: AuthError | null }> {
  try {
    const isDemo = localStorage.getItem(DEMO_STORAGE_KEY)
    if (isDemo) {
      const parsed = JSON.parse(isDemo)
      const updatedUser: User = {
        ...parsed,
        user_metadata: {
          ...parsed.user_metadata,
          ...(data.username !== undefined
            ? { full_name: data.username, username: data.username }
            : {}),
          ...(data.avatarUrl !== undefined ? { avatar_url: data.avatarUrl } : {}),
        },
      }
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updatedUser))
      return { data: { user: updatedUser }, error: null }
    }

    const updatePayload: {
      data: {
        username?: string
        full_name?: string
        avatar_url?: string | null
      }
    } = {
      data: {
        ...(data.username !== undefined
          ? { full_name: data.username, username: data.username }
          : {}),
        ...(data.avatarUrl !== undefined ? { avatar_url: data.avatarUrl } : {}),
      },
    }

    const { data: resData, error } = await supabase.auth.updateUser(updatePayload)
    return { data: resData, error }
  } catch (err: any) {
    return { data: null, error: err as AuthError }
  }
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  try {
    const isDemo = localStorage.getItem(DEMO_STORAGE_KEY)
    if (isDemo) {
      return { error: null }
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  } catch (err: any) {
    return { error: err as AuthError }
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err: any) {
    return { error: err as AuthError }
  }
}

// ─── Context & Provider ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const localUserJson = localStorage.getItem(DEMO_STORAGE_KEY)
    if (localUserJson) {
      try {
        return JSON.parse(localUserJson)
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }
    return null
  })
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('user')
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS)
  const [isActive, setIsActive] = useState(true)

  const syncProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setRole('user')
      setPermissions(DEFAULT_PERMISSIONS)
      setIsActive(true)
      return
    }

    try {
      const profile = await ensureUserProfile(currentUser)
      setRole(profile.role)
      setPermissions(profile.permissions)
      setIsActive(profile.is_active)
    } catch {
      // Fallback: check email whitelist
      const isAdmin = isDefaultAdminEmail(currentUser.email)
      setRole(isAdmin ? 'admin' : 'user')
      setPermissions(DEFAULT_PERMISSIONS)
      setIsActive(true)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    const profile = await getUserProfile(user.id)
    if (profile) {
      setRole(profile.role)
      setPermissions(profile.permissions)
      setIsActive(profile.is_active)
    }
  }

  useEffect(() => {
    const localUserJson = localStorage.getItem(DEMO_STORAGE_KEY)
    if (localUserJson) {
      try {
        const parsed = JSON.parse(localUserJson)
        setUser(parsed)
        syncProfile(parsed).finally(() => setLoading(false))
        return
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        setSession(session)
        setUser(session?.user ?? null)
        syncProfile(session?.user ?? null).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        setSession(session)
        setUser(session?.user ?? null)
        syncProfile(session?.user ?? null).finally(() => setLoading(false))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpdateProfile = async (data: { username?: string; avatarUrl?: string | null }) => {
    const res = await updateUserProfile(data)
    if (!res.error && res.data?.user) {
      setUser(res.data.user)
      await syncProfile(res.data.user)
    }
    return res
  }

  const handleUpdatePassword = async (newPassword: string) => {
    return await updateUserPassword(newPassword)
  }

  const signInDemo = async () => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_USER))
    setUser(DEMO_USER)
    setSession(null)
    await syncProfile(DEMO_USER)
  }

  const handleSignOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    setUser(null)
    setSession(null)
    setRole('user')
    setPermissions(DEFAULT_PERMISSIONS)
    setIsActive(true)
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    role,
    permissions,
    isActive,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    updateUserProfile: handleUpdateProfile,
    updateUserPassword: handleUpdatePassword,
    refreshProfile,
    signInDemo,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider')
  }
  return context
}

export function useIsAdmin(): boolean {
  const { role } = useAuth()
  return role === 'admin'
}

export function usePermissions(): UserPermissions {
  const { permissions, role } = useAuth()
  if (role === 'admin') {
    return { attendance: true, finance: true, todo: true }
  }
  return permissions
}
